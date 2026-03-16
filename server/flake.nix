{
  description = "A Nix-flake-based Dotnet development environment";

  inputs.nixpkgs.url = "https://flakehub.com/f/NixOS/nixpkgs/0.1";

  outputs =
    { self,... }@inputs:
    let
      # Target dotnet version
      dotnetVersion = 10;

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
            pkgs = import inputs.nixpkgs {
              inherit system;
              config.allowUnfree = true;
            };
          }
        );
    in
    {
      devShells = forEachSupportedSystem (
        { pkgs }:
        let
          # Dotnet sdk (version is specified by overlay)
          sdk = pkgs.dotnetCorePackages."sdk_${toString dotnetVersion}_0";

          # Dotnet runtime (version is specified by overlay)
          runtime = pkgs.dotnetCorePackages."runtime_${toString dotnetVersion}_0";

          # Aspnet runtime (version is specified by overlay)
          aspnetcore = pkgs.dotnetCorePackages."aspnetcore_${toString dotnetVersion}_0";

          # Retrieve the .NET 9 SDK explicitly
          # This is required because the current version of csharp-ls in nixpkgs is compiled 
          # against the .NET 9 runtime and will fail to launch if this runtime is missing
          toolingSdk = pkgs.dotnetCorePackages.sdk_9_0;

          # Use combine packages
          dotnetCombined = pkgs.dotnetCorePackages.combinePackages [
            sdk
            runtime
            aspnetcore
            toolingSdk
          ];

          # Wraps csharp-ls to point to our specific dotnet environment (Fix for: https://github.com/NixOS/nixpkgs/issues/464575)
          csharpLsFixed = pkgs.writeShellScriptBin "csharp-ls" ''
            export DOTNET_ROOT="${dotnetCombined}/share/dotnet"
            export DOTNET_ROOT_X64="$DOTNET_ROOT"
            export DOTNET_MULTILEVEL_LOOKUP=0
            exec "${pkgs.csharp-ls}/bin/csharp-ls" "$@"
          '';

          # Required for things like System.Drawing, SSL, and Globalization (ICU)
          systemLibs = pkgs.lib.makeLibraryPath [
            pkgs.stdenv.cc.cc
            pkgs.zlib
            pkgs.icu
            pkgs.openssl
          ];
        in
        {
          default = pkgs.mkShell {
            packages = [
              dotnetCombined
              csharpLsFixed
              pkgs.csharpier
              pkgs.netcoredbg
            ];

            env = {
              DOTNET_ROOT = "${dotnetCombined}/share/dotnet";
              DOTNET_ROOT_X64 = "${dotnetCombined}/share/dotnet";
              DOTNET_MULTILEVEL_LOOKUP = "0";
              DOTNET_CLI_TELEMETRY_OPTOUT = "1";
              DOTNET_NOLOGO = "1";
            };

            shellHook = ''
              export LD_LIBRARY_PATH="${systemLibs}:$LD_LIBRARY_PATH"
            '';
          };
        }
      );
    };
}
