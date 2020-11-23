{ config, pkgs, ... }:

{
  services.nginx.enable = true;
  services.nginx.virtualHosts."distilledmagazine.com" = {
    enableACME = true;
    forceSSL = true;

    locations."/" = {
      root = "/ipfs/QmY7NgQEnbxh2TF15RWa1v2CzrPesi1SqztxeephYnZjdM";
      tryFiles = "$uri $uri/index.html $uri.html =404";
    };
  };

  services.nginx.virtualHosts."www.distilledmagazine.com" = {
    serverAliases = [
      "www.distilledmagazine.org"
      "distilledmagazine.org"
      "www.distilledpamphlets.com"
      "distilledpamphlets.com"
    ];

    locations."/" = {
      return = "301 https://distilledmagazine.com$request_uri";
    };
  };

  networking.firewall.allowedTCPPorts = [ 80 443 ];
}
