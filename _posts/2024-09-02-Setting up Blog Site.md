# Setting up https://synxn1o.github.io

using starter pack from [cotes2020/jekyll-theme-chirpy: A minimal, responsive, and feature-rich Jekyll theme for technical writing. (github.com)](https://github.com/cotes2020/jekyll-theme-chirpy), you can easily build a static blog site by following the instruction.
It converts .md (hugo) to html website with many features including global searching, multi-device rendering, and so on.
To post blogs I have to
1. export markdown file to hugo markdown file using plugins in Obsidian
2. git fetch my repo
3. move .md to ./\_posts/
4. move all attached files to ./assets/, and redirect the files in .md
5. git add . && git commit -m ".."
6. git push -u origin main
7. wait for github to compile it
\# Setting up https://liuxy.space
I bought this domain for 10 years costing 188 yuan. After registered the domain with my ID card, I am now able to CNAME this site to the previous GitHub site.

# Notes

1.  the SSL cert expires every 3 months.
2.  I can move the site to cloudflare after 60 days (2mo).
3.  I need to compile the webpage locally.
