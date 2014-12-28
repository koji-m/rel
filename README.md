Rel
===============

Rel is a Chart posting micro-blog platform on web.

![rel_screen](https://raw.github.com/wiki/koji-m/rel/images/rel_splash.gif)

##Demo
You can try out fully functional demo working on Heroku.

**Demo Site: [http://rel.herokuapp.com/](http://rel.herokuapp.com/)**

Description
===============
Rel is micro-blogging paltform like twitter. But main usage is Posting Chart and Share it with others.
Rel has following major features.

- Post Line Chart
- Edit previousely posted chart and post it for update
- Two editing styles - Drag&Drop or CSV file upload
- Usual features for micro-blog - follow, reply, quote
- Search post by hash tag

Rel is written in Ruby on Sinatra and Javascript. I confirmed that the system is work with PostgreSQL and SQLite3.


Installation
===============

To use Rel on your server or try out locally, you can deploy it as following:  
(I have tested locally on WEBRICK and deployed on Heroku)

1. Download source files.
 ```
 	$ git clone https://github.com/koji-m/rel.git
 ```
 
2. Install dependencies using Bundler.
 ```
 	$ cd rel
	$ bundle install
 ```
 (The Bundler have not installed yet, install it by `gem install bundler`)
 
3. Generate configuration file and fix it for your environment.
 ```
 	$ bundle exec rake app:env     # generate .env file
 	$ vi .env                      # edit environment variable value
 ```
 
4. Create data base tables.
 ```
 	$ bundle exec rake db:init
 ```

5. Start up application.
 ```
 	$ bundle exec rackup lib/config.ru
 ```
 
Now you can test it.


#### *installation note*
- Rel is using OAuth authentication method not only username/password authentication.
So you must register your application with [Twitter Apps](https://apps.twitter.com/) and
set the consumer key/secret to .env file.
- For SSL secret, you must set SESSION_SECRET, SSL_AT_KEY, SSL_ATS_KEY in .env file to values
formed at random.
- You can also use Adobe Typekit optionally. If you do so, set the Kit URL to TYPEKIT_URL in .env file.

Lincense
===============

Rel is released under the MIT License, see LICENSE.txt.

Thanks to
[Sinatra](http://www.sinatrarb.com/) / [jQuery](http://jquery.com/) / [jqPlot](http://www.jqplot.com/index.php) /
[Bootstrap](http://getbootstrap.com/) / [Glyphicons](http://glyphicons.com/) ...and other libraries.
