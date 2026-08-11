{
  description = "socials - Node.js express app";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          packages = [
            pkgs.nodejs_22
          ];
        };

        apps.default = {
          type = "app";
          program = "${pkgs.writeShellScript "socials" ''
            exec ${pkgs.nodejs_22}/bin/node ${./.}/index.js
          ''}";
        };
      });
}
