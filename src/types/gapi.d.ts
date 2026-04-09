// Type declarations for Google API and Google Identity Services

declare namespace gapi {
  namespace client {
    function init(config: {
      apiKey: string;
      discoveryDocs: string[];
    }): Promise<void>;

    function getToken(): { access_token: string } | null;
    function setToken(token: { access_token: string } | null): void;

    namespace sheets {
      namespace spreadsheets {
        namespace values {
          function get(params: {
            spreadsheetId: string;
            range: string;
          }): Promise<{ result: { values?: string[][] } }>;

          function append(params: {
            spreadsheetId: string;
            range: string;
            valueInputOption: string;
            resource: { values: unknown[][] };
          }): Promise<unknown>;

          function update(params: {
            spreadsheetId: string;
            range: string;
            valueInputOption: string;
            resource: { values: unknown[][] };
          }): Promise<unknown>;
        }
      }
    }
  }

  function load(
    api: string,
    callback: () => void | Promise<void>
  ): void;
}

declare namespace google {
  namespace accounts {
    namespace oauth2 {
      interface TokenClient {
        callback: (response: TokenResponse) => void;
        requestAccessToken(options: { prompt: string }): void;
      }

      interface TokenResponse {
        access_token: string;
        error?: string;
        error_description?: string;
      }

      function initTokenClient(config: {
        client_id: string;
        scope: string;
        callback: string | ((response: TokenResponse) => void);
      }): TokenClient;

      function revoke(
        token: string,
        callback: () => void
      ): void;
    }
  }
}
