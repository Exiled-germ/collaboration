// Notion API integration for importing project data
import { Client } from '@notionhq/client';

export interface NotionPageContent {
  title: string;
  content: string;
  properties: Record<string, any>;
  url: string;
}

export class NotionService {
  private client: Client | null = null;
  private apiKey: string | null = null;

  constructor(apiKey?: string) {
    if (apiKey) {
      this.initialize(apiKey);
    }
  }

  initialize(apiKey: string) {
    this.apiKey = apiKey;
    this.client = new Client({ auth: apiKey });
  }

  isInitialized(): boolean {
    return this.client !== null;
  }

  async getPage(pageId: string): Promise<NotionPageContent> {
    if (!this.client) {
      throw new Error('Notion client not initialized. Please provide an API key.');
    }

    try {
      // Remove hyphens from page ID if present
      const cleanPageId = pageId.replace(/-/g, '');

      // Get page metadata
      const page = await this.client.pages.retrieve({ page_id: cleanPageId });

      // Get page content (blocks)
      const blocks = await this.client.blocks.children.list({
        block_id: cleanPageId,
      });

      // Extract title
      let title = 'Untitled';
      if ('properties' in page && page.properties.title) {
        const titleProp = page.properties.title as any;
        if (titleProp.title && titleProp.title.length > 0) {
          title = titleProp.title[0].plain_text;
        }
      }

      // Extract content from blocks
      const content = this.extractTextFromBlocks(blocks.results);

      return {
        title,
        content,
        properties: 'properties' in page ? page.properties : {},
        url: 'url' in page ? page.url : '',
      };
    } catch (error) {
      console.error('Error fetching Notion page:', error);
      throw new Error(`Failed to fetch Notion page: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getDatabase(databaseId: string): Promise<NotionPageContent[]> {
    if (!this.client) {
      throw new Error('Notion client not initialized. Please provide an API key.');
    }

    try {
      const cleanDatabaseId = databaseId.replace(/-/g, '');

      // Query database - use the correct method
      const response: any = await (this.client as any).databases.query({
        database_id: cleanDatabaseId,
      });

      // Fetch content for each page
      const pages = await Promise.all(
        response.results.map(async (page: any) => {
          try {
            return await this.getPage(page.id);
          } catch (error) {
            console.error(`Error fetching page ${page.id}:`, error);
            return null;
          }
        })
      );

      return pages.filter((page): page is NotionPageContent => page !== null);
    } catch (error) {
      console.error('Error fetching Notion database:', error);
      throw new Error(`Failed to fetch Notion database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractTextFromBlocks(blocks: any[]): string {
    let text = '';

    for (const block of blocks) {
      const blockType = block.type;

      switch (blockType) {
        case 'paragraph':
          text += this.extractRichText(block.paragraph.rich_text) + '\n\n';
          break;
        case 'heading_1':
          text += '# ' + this.extractRichText(block.heading_1.rich_text) + '\n\n';
          break;
        case 'heading_2':
          text += '## ' + this.extractRichText(block.heading_2.rich_text) + '\n\n';
          break;
        case 'heading_3':
          text += '### ' + this.extractRichText(block.heading_3.rich_text) + '\n\n';
          break;
        case 'bulleted_list_item':
          text += '- ' + this.extractRichText(block.bulleted_list_item.rich_text) + '\n';
          break;
        case 'numbered_list_item':
          text += '1. ' + this.extractRichText(block.numbered_list_item.rich_text) + '\n';
          break;
        case 'to_do':
          const checked = block.to_do.checked ? '[x]' : '[ ]';
          text += `${checked} ${this.extractRichText(block.to_do.rich_text)}\n`;
          break;
        case 'toggle':
          text += this.extractRichText(block.toggle.rich_text) + '\n';
          break;
        case 'code':
          text += '```\n' + this.extractRichText(block.code.rich_text) + '\n```\n\n';
          break;
        case 'quote':
          text += '> ' + this.extractRichText(block.quote.rich_text) + '\n\n';
          break;
        case 'callout':
          text += '💡 ' + this.extractRichText(block.callout.rich_text) + '\n\n';
          break;
        case 'divider':
          text += '---\n\n';
          break;
        default:
          // Handle other block types
          if (block[blockType]?.rich_text) {
            text += this.extractRichText(block[blockType].rich_text) + '\n';
          }
      }
    }

    return text.trim();
  }

  private extractRichText(richTextArray: any[]): string {
    if (!richTextArray || richTextArray.length === 0) {
      return '';
    }

    return richTextArray
      .map((richText) => richText.plain_text || '')
      .join('');
  }

  // Helper method to extract page ID from Notion URL
  static extractPageIdFromUrl(url: string): string | null {
    // Notion URLs format: https://www.notion.so/Page-Title-{pageId}
    const match = url.match(/([a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
    return match ? match[1] : null;
  }
}

// Singleton instance
let notionServiceInstance: NotionService | null = null;

export function getNotionService(apiKey?: string): NotionService {
  if (!notionServiceInstance) {
    notionServiceInstance = new NotionService(apiKey);
  } else if (apiKey && !notionServiceInstance.isInitialized()) {
    notionServiceInstance.initialize(apiKey);
  }
  return notionServiceInstance;
}
