import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function TestConnection() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const testConnection = async () => {
    setTesting(true);
    const testResults: any = {
      timestamp: new Date().toISOString(),
      tests: []
    };

    // Test 1: Environment Variables
    testResults.tests.push({
      name: "Environment Variables",
      status: import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY ? "✅ Pass" : "❌ Fail",
      details: {
        url: import.meta.env.VITE_SUPABASE_URL || "Missing",
        hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
      }
    });

    // Test 2: Supabase Client
    try {
      const { data, error } = await supabase.auth.getSession();
      testResults.tests.push({
        name: "Supabase Client",
        status: error ? "❌ Fail" : "✅ Pass",
        details: { hasSession: !!data.session, error: error?.message }
      });
    } catch (error) {
      testResults.tests.push({
        name: "Supabase Client",
        status: "❌ Fail",
        details: { error: error instanceof Error ? error.message : "Unknown error" }
      });
    }

    // Test 3: Database Connection
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('count')
        .limit(1);
      
      testResults.tests.push({
        name: "Database Connection (team_members)",
        status: error ? "❌ Fail" : "✅ Pass",
        details: { error: error?.message, data }
      });
    } catch (error) {
      testResults.tests.push({
        name: "Database Connection",
        status: "❌ Fail",
        details: { error: error instanceof Error ? error.message : "Unknown error" }
      });
    }

    // Test 4: Gemini API Key
    testResults.tests.push({
      name: "Gemini API Key",
      status: import.meta.env.VITE_GEMINI_API_KEY ? "✅ Pass" : "❌ Fail",
      details: { hasKey: !!import.meta.env.VITE_GEMINI_API_KEY }
    });

    // Test 5: Resend API Key
    testResults.tests.push({
      name: "Resend API Key (Optional)",
      status: import.meta.env.VITE_RESEND_API_KEY ? "✅ Pass" : "⚠️ Not Set",
      details: { hasKey: !!import.meta.env.VITE_RESEND_API_KEY }
    });

    setResults(testResults);
    setTesting(false);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>PhaseFlow Connection Test</CardTitle>
            <CardDescription>
              Test all connections and configurations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testConnection} 
              disabled={testing}
              className="w-full"
            >
              {testing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                "Run Connection Test"
              )}
            </Button>

            {results && (
              <div className="space-y-4 mt-6">
                <div className="text-sm text-muted-foreground">
                  Test completed at: {new Date(results.timestamp).toLocaleString()}
                </div>

                {results.tests.map((test: any, index: number) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{test.name}</CardTitle>
                        <span className="text-sm font-mono">{test.status}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                        {JSON.stringify(test.details, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                ))}

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Next Steps:</h3>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>If "Database Connection" fails: Run SIMPLE_SETUP.sql in Supabase</li>
                    <li>If "Environment Variables" fails: Check .env file</li>
                    <li>If "Supabase Client" fails: Check Supabase project status</li>
                    <li>If all pass: You're ready to use PhaseFlow!</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
