{
  description = "Krea development environment with deno and Fedify";

  inputs.nixpkgs.url = "https://flakehub.com/f/NixOS/nixpkgs/0.1";

  outputs =
    { self, ... }@inputs:
    let
      supportedSystems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];
      forEachSupportedSystem =
        f:
        inputs.nixpkgs.lib.genAttrs supportedSystems (
          system:
          f {
            pkgs = import inputs.nixpkgs { inherit system; };
          }
        );
    in {
      devShells = forEachSupportedSystem (
        { pkgs }: {
          default = pkgs.mkShellNoCC {
            packages = with pkgs; [
              deno
              podman

              # Fedify CLI Wrapper
              (writeShellScriptBin "fedify" ''
                exec ${deno}/bin/deno run \
                  --allow-all \
                  --unstable-fs \
                  --unstable-kv \
                  --unstable-temporal \
                  --jsr:@fedify/cli "$@"
              '')

              # Start Postgres
              (writeShellScriptBin "start-pg" ''
                if ! ${podman}/bin/podman container exists krea-postgres; then
                   echo "Creating and starting new krea-postgres container..."
                   ${podman}/bin/podman run \
                     --name krea-postgres \
                     -e POSTGRES_PASSWORD=1234 \
                     -p 5432:5432 \
                     -d postgres:16-alpine
                else
                   echo "Container krea-postgres exists. Starting..."
                   ${podman}/bin/podman start krea-postgres
                fi
                echo "Postgres is ready on port 5432."
              '')

              # Stop Postgres
              (writeShellScriptBin "stop-pg" ''
                if ${podman}/bin/podman container exists krea-postgres; then
                   ${podman}/bin/podman stop krea-postgres
                   echo "Postgres container stopped."
                else
                   echo "No krea-postgres container found to stop."
                fi
              '')
            ];

            shellHook = ''
              export DENO_INSTALL_ROOT="$HOME/.deno/bin"
              mkdir -p "$DENO_INSTALL_ROOT"
              export PATH="$DENO_INSTALL_ROOT:$PATH"
              
              echo "Environment ready."
              echo "Commands available: 'start-pg', 'stop-pg', 'fedify'"
            '';
          };
        }
      );
    };
}
