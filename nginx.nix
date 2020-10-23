{ config, pkgs, ... }:

{
  services.nginx.enable = true;
  services.nginx.virtualHosts."distilledmagazine.com" = {
    enableACME = true;
    forceSSL = true;

    locations."/" = {
      root = "/var/distilled/public";
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
