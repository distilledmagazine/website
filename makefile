.PHONY: proof live content

_site: _layouts _config.yml index.html content
	jekyll build
	
content: 
	git submodule init
	git submodule update

proof: _site
	surge $< distilledmagazine.surge.sh

live: _site
	surge $< distilledmagazine.com

