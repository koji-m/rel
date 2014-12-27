# coding: utf-8

class MustBeEmptyValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    if value.empty?
      true
    else
      record.errors.add(attribute, 'cannot be set.')
      false
    end
  end
end
