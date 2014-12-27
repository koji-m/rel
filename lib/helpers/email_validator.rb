# coding: utf-8

require 'mail'
require 'resolv'

class EmailValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    begin
      m = Mail::Address.new(value)
      r = m.domain && m.address == value

      mx = []
      Resolv::DNS.open do |dns|
        domain = m.domain.downcase

        mx = dns.getresources(domain, Resolv::DNS::Resource::IN::MX) +
          dns.getresources(domain, Resolv::DNS::Resource::IN::A)
      end

      if r && mx.size > 0
        true
      else
        record.errors.add(attribute, 'is invalid.')
        false
      end
    rescue Exception
      record.errors.add(attribute, 'is invalid.')
      false
    end
  end
end
