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

              # Fedify CLI Wrapper
              (writeShellScriptBin "fedify" ''
                exec ${deno}/bin/deno run \
                  --allow-all \
                  --unstable-fs \
                  --unstable-kv \
                  --unstable-temporal \
                  jsr:@fedify/cli "$@"
              '')
            ];

            shellHook = ''
              export DENO_INSTALL_ROOT="$HOME/.deno/bin"
              mkdir -p "$DENO_INSTALL_ROOT"
              export PATH="$DENO_INSTALL_ROOT:$PATH"
            '';
          };
        }
      );
    };
}
