require 'active_record'
require 'dotenv'

Dotenv.load

ActiveRecord::Base.establish_connection(ENV['DATABASE_URL'])

ActiveRecord::Schema.define do

  create_table "users", force: true do |t|
    t.string "name", null: false
    t.string "email", null: false
    t.string "password", null: false
    t.string "password_salt"
    t.string "provider", null: false
    t.integer "uid", null: false
    t.string "access_token"
    t.string "access_token_secret"
    t.string "prof_img", null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "users", ["name"], unique: true, name: "index_users_on_name"
  add_index "users", ["email"], unique: true, name: "index_users_on_email"
  add_index "users", ["uid", "provider"], unique: true, name: "index_users_on_uid_and_provider"

  create_table "follows", force: true do |t|
    t.references :user, index: true, null: false
    t.integer "followee", null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "follows", ["followee"], name: "index_follows_on_followee"

  create_table "posts", force: true do |t|
    t.references :user, index: true, null: false
    t.string  "comment"
    t.references :chart, index: true
    t.integer "quote"
    t.integer "reply_to"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "posts", ["quote"], name: "index_posts_on_quote"
  add_index "posts", ["reply_to"], name: "index_posts_on_reply_to"
  add_index "posts", ["comment"], name: "index_posts_on_comment"

  create_table "hash_tags", force: true do |t|
    t.references :post, index: true, null: false
    t.string "tag", null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "hash_tags", ["tag"], name: "index_hash_tags_on_tag"

  create_table "charts", force: true do |t|
    t.text "option", null: false
    t.text "data", null: false
    t.text "title", null: false
    t.text "xlabel", null: false
    t.text "ylabel", null: false
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "charts", ["title"], name: "index_charts_on_title"
  add_index "charts", ["xlabel"], name: "index_charts_on_xlabel"
  add_index "charts", ["ylabel"], name: "index_charts_on_ylabel"
end
