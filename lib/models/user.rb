# coding: utf-8

require 'active_record'

class User < ActiveRecord::Base
  has_many :follows
  has_many :followed_by, options = {:class_name => "Follow", :foreign_key => :followee}
  has_many :posts

  validates :name,
  presence: true,
  uniqueness: true,
  length: {maximum: 15},
  format: {with: /\A\w+\z/}

  with_options if: 'provider == "rel"' do |prv|
    prv.validates :password,
    presence: true,
    length: {minimum: 8}

    prv.validates :email,
    presence: true,
    email: true
  end

  with_options if: 'provider == "twitter"' do |prv|
    prv.validates :password,
    must_be_empty: true
  end

  validates :prof_img,
  presence: true,
  image_url: true
  
  OPENSSL_CFG = CONFIG['openssl']
  PKCS5_ITERATION = OPENSSL_CFG['pkcs5']['iteration']
  PKCS5_KEYLEN = OPENSSL_CFG['pkcs5']['keylen']
  PKCS5_DIGEST = OPENSSL_CFG['pkcs5']['digest']

  # Authenticate by username and password.
  def self.authenticate(name, password)
    user = where(name: name).first
    if user && user.provider == 'rel' && user.password_eq?(password)
      user
    else
      nil
    end
  end

  def self.auth_twitter(access_token)
    res = access_token.get(TW_API_USER_INFO)

    user_info = JSON.load(res.body)

    self.tw_authenticate(user_info, access_token)
    
  end

  def self.tw_authenticate(user_info, access_token)
    # Sign-in if exist
    user = User.where(provider: 'twitter', uid: user_info['id']).first
    if user
      user.access_token = access_token.token
      user.access_token_secret = access_token.secret
      user.save
      
      return user
    end



    # Register user
    # If screen_name(on twitter) is already in use, prompt user to change.
    if User.where(name: user_info['screen_name']).any?
      return RelSupport.new(auth_twitter: user_info)
    end

    user = User.new(name: user_info['screen_name'], email: '', password: '',
                    provider: 'twitter', uid: user_info['id'],
                    prof_img: user_info['profile_image_url'],
                    access_token: access_token.token,
                    access_token_secret: access_token.secret)

    user.save
    
    user
  end
  
  # Save user record with default settings.
  def save_default
    self.provider = 'rel'
    self.uid = -1
    self.prof_img = CONFIG['avatar']['default']
    self.encrypt_password
    if self.save && self.update(uid: self.id)
      self
    else
      nil
    end
  end
  
  # Before save user record, encrypt its password with salt.
  def encrypt_password
    if password.present?
      self.password_salt = OpenSSL::Random.random_bytes(OPENSSL_CFG['random']['len']).unpack("h*")[0]
      self.password = hash_secret(self.password, password_salt)
    end
  end

  # Generate digest for given password.
  def hash_secret(password, salt)
    OpenSSL::PKCS5.pbkdf2_hmac(password, salt,
                               PKCS5_ITERATION, PKCS5_KEYLEN, PKCS5_DIGEST).unpack("h*")[0]
  end

  def password_eq?(pswd)
    salt = self.password_salt
    return false if salt.nil? || salt.empty?
    
    self.password == hash_secret(pswd, salt)
  end

  def follow(username)  # should return #<User> and return with errors.messages
    target = User.where(name: username).first
    if target
      flw = Follow.new(user_id: self.id, followee: target.id)
      flw.save
    else
      false
    end
  end
  
end
