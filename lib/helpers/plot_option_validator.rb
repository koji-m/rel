# coding: utf-8

class PlotOptionValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    options = Marshal.load(value)
    series = options['series']

    series.each do |s|
      if s['label'].length > 20
        record.errors.add(:series_label, 'is too long (maximum is 20 characters).')
        return false
      end
    end

    true
  end
end
