# jQueryUIDateTimePicker
A simple alternative to the built-in Mendix datepicker, that uses the jQueryUI Datepicker and Trent Richardson's Timepicker addon (http://trentrichardson.com/examples/timepicker/).

Some key-features:
- select picker type (datepicker, timepicker, or datetimepicker)
- set custom date/time format
- set a year range and/or time range
- set a custom placeholder text
- select several themes, including a Mendix based theme

## Installation
Add the widget to a dataview and select a datetime attribute the date/time should be saved to.

## Configuration
  #### General
  _Attribute_: The DateTime attribute the data is stored in
  
  _Picker type_: Set the picker type: Date picker, time picker, or Date and Time picker
  
  _Display button bar_: If set to 'yes', displays 'Today' and 'Done' buttons
  
  #### Display
  _Icon tooltip_: Set a tooltip on the calendar icon
  
  _Placeholder text_: Set a custom placeholder text. If left empty, the date/time format will be shown as placeholder
  
  _Label_: The label to show on the form. Leave empty for no label
  
  _Label width_: Width of the label. Only applicable for horizontal display
  
  _Label display_: Horizontal (next to the input) or verticel (above the input)
  
  _Theme_: set a theme/style for the datepicker
  
  #### Date options
  _Custom date format_: set a custom date format to be used. See jQueryUI documentation (http://api.jqueryui.com/datepicker/#utility-formatDate) for possible formats
  
  _Default date_: The default date. Should be corresponding to the date format
  
  _Range_: Range in years. Can be either absolute (1970:2018) or relative (-10:+10)
  
  #### Time options
  _Time format_: Set a custom time format to be used. See Time picker documentation (http://trentrichardson.com/examples/timepicker/#tp-formatting) for possible formats
  
  _Minimum/Maximum time_: Set the minimum/maximum time of the timepicker. Should be corresponding to the time format
  
  _Add slider buttons_: Show +/- buttons next to the slider
  
  #### Behaviour
  Set optional on-click microflow

## Known bugs
None
