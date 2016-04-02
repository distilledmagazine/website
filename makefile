.PHONY: proof live

_site: _posts _layouts _config.yml index.html
	jekyll build
	
proof: _site
	surge $< distilledmagazine.surge.sh

live: _site
	surge $< distilledmagazine.com

