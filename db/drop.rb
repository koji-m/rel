require 'active_record'
require 'dotenv'

Dotenv.load

ActiveRecord::Base.establish_connection(ENV['DATABASE_URL'])

ActiveRecord::Schema.define do

  drop_table "users"
  drop_table "follows"
  drop_table "posts"
  drop_table "hash_tags"
  drop_table "charts"
