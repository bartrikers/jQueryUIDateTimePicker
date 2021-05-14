/*
    Custom Mendix Widget
    "jQueryUIDateTimePicker"
    Apache License 2.0
	Copyright 2018 Bizzomate (Bart Rikers, Joppe van Gisbergen)
    Copyright 2017 Marcus Groen (added functionality)
*/
define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dijit/_TemplatedMixin",
    "mxui/dom",
	"dojo/dom-class",
    "dojo/on",
    "dojo/dom-construct",
    "dojo/html",
    "dojo/text!jQueryUIDateTimePicker/widget/template/jQueryUIDateTimePicker.html",
    "jQueryUIDateTimePicker/lib/jquery-1.12.4",
    "jQueryUIDateTimePicker/lib/jquery-ui",
    "jQueryUIDateTimePicker/lib/jquery-ui-i18n",
    "jQueryUIDateTimePicker/lib/jquery-ui-sliderAccess",
    "jQueryUIDateTimePicker/lib/jquery-ui-timepicker-addon",
    "jQueryUIDateTimePicker/lib/jquery-ui-timepicker-addon-i18n"
], function(declare, _WidgetBase, _TemplatedMixin, dom, domClass, dojoOn, dojoConstruct, dojoHtml, widgetTemplate, $) {
    "use strict";

    return declare("jQueryUIDateTimePicker.widget.jQueryUIDateTimePicker", [
        _WidgetBase,
        _TemplatedMixin
    ], {
        // _TemplatedMixin will create our dom node using this HTML template.
        templateString: widgetTemplate,

        // Parameters configured in the Modeler.
        pickerType: "",
        useCustomDateFormat: "",
        customDateFormat: "",
		addSliderButtons: "",
        showButtonBar: "",
        iconTooltip: "",
        placeholderText: "",
        showMonthYearMenu: "",
        showWeekNr: "",
        firstDay: "",
        yearRange: "",
        defaultDate: "",
        onChangeMicroflow: "",
		onChangeNanoflow: "",
        onChangeMicroflowProgress: "",
        onChangeMicroflowProgressMsg: "",
        onChangeMicroflowAsync: "",

        /* Timepicker options*/
        /* http://trentrichardson.com/examples/timepicker/ */
        useCustomTimeFormat: false,
        customTimeFormat: "",
        minTime: "",
        maxTime: "",

		/* Label options */
		labelCaption: "",
        labelWidth: "",
        displayEnum: "",

        // Internal variables. Non-primitives created in the prototype are shared between all widget instances.
        _handle: null,
        _alertDiv: null,
        _contextObj: null,
        _datePicker: null,
        _datePickerButton: null,
        _params: null,
        _seven: 7,
        _readOnly: false,

        // dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
        postCreate: function postCreate() {
            logger.debug(this.id + ".postCreate");

            if (this.readOnly || this.get("disabled") || this.readonly) {
                this._readOnly = true;
            }

            this._datePickerButton = $(this.domNode)
                .find("button.mx-dateinput-select-button")
                .first()
                .get(0);
            $(this._datePickerButton).attr("title", this.iconTooltip);

            this._datePicker = $(this.domNode)
                .find("input.mx-dateinput-input")
                .first()
                .get(0);

            // substracting the first two characters of the Mendix user language ("nl_NL")
			var mxConfig = mx.session.getConfig();
            var localeCode;
			if (mxConfig.locale) {
				localeCode = mxConfig.locale.code;
			} else if (mxConfig.uiconfig.locale) {
				localeCode = mxConfig.uiconfig.locale;
			}
			
            if (localeCode) { 
            	var mxLanguage = localeCode.replace("_", "-"); 
            	var mxLanguageSub = mxLanguage.substring(0, 2);
            	//first, try to find language based on full locale string, but replace underscore ("en_US" -> "en-US")
            	var datePickerLanguage = $.datepicker.regional[mxLanguage];
            	var timePickerLanguage = $.timepicker.regional[mxLanguage];
			
				//if not found, try to find language based on first two characters ("en")
				if (!datePickerLanguage) {
					datePickerLanguage = $.datepicker.regional[mxLanguageSub];
				}
				if (!timePickerLanguage) {
					timePickerLanguage = $.timepicker.regional[mxLanguageSub];
				}
				
				// if still not found, use default ("")
				if (!datePickerLanguage) {
					datePickerLanguage = $.datepicker.regional[""];
				}
				if (!timePickerLanguage) {
					timePickerLanguage = $.timepicker.regional[""];
				}
            }
            else {
            	// if still not found, use default ("")			 
				datePickerLanguage = $.datepicker.regional[""];						 
				timePickerLanguage = $.timepicker.regional[""];			
            }
			
			//determine placeholder texts
			var dateFormat = datePickerLanguage.dateFormat;
			var timeFormat = timePickerLanguage.timeFormat;
			
			if (this.useCustomDateFormat) {
				dateFormat = this.customDateFormat;
			}
			
			if (this.useCustomTimeFormat) {
				timeFormat = this.customTimeFormat;
			} 
			
            this._setParams(dateFormat, timeFormat);

			var defaultPlaceholderText = '';
            switch (this.pickerType) {
            case "DatePicker":
                $(this._datePicker).datepicker(this.params);
                if (typeof datePickerLanguage !== "undefined") {
					if (this.params.firstDay) {
						datePickerLanguage.firstDay = this.params.firstDay;
					}
					if (this.params.dateFormat) {
						datePickerLanguage.dateFormat = this.params.dateFormat;
					}
                    $(this._datePicker).datepicker("option", datePickerLanguage);
                }
				defaultPlaceholderText = dateFormat;
                break;
            case "TimePicker":
                $(this._datePicker).timepicker(this.params);
                if (typeof timePickerLanguage !== "undefined") {
                    $(this._datePicker).timepicker("option", timePickerLanguage);
                }
				defaultPlaceholderText = timeFormat;
				
                break;
            case "DateTimePicker":
            default:
                $(this._datePicker).datetimepicker(this.params);
                if (typeof datePickerLanguage !== "undefined") {
					if (this.params.firstDay) {
						datePickerLanguage.firstDay = this.params.firstDay;
					}
					if (this.params.dateFormat) {
						datePickerLanguage.dateFormat = this.params.dateFormat;
					}
                    $(this._datePicker).datepicker("option", datePickerLanguage);
                }
                if (typeof timePickerLanguage !== "undefined") {
                    $(this._datePicker).timepicker("option", timePickerLanguage);
                }
				
				defaultPlaceholderText = dateFormat + " " + timeFormat;
				
                break;
            }

			//Set placeholderText
			if (this.placeholderText && this.placeholderText.trim().length) {
				defaultPlaceholderText = this.placeholderText;
			}
			$(this._datePicker).attr("placeholder", defaultPlaceholderText);

			// Set label
			if (this.labelCaption && this.labelCaption.trim().length) {
                this.inputLabel.innerHTML = this.labelCaption;
            } else {
                dojoConstruct.destroy(this.inputLabel);
            }

            if (this.displayEnum === "horizontal") {
                domClass.add(this.inputLabel, "col-sm-" + this.labelWidth);
                domClass.add(this.inputWrapper, "col-sm-" + (12 - this.labelWidth));
            }

            this._setupEvents();
			
			//load appropriate css theme file
			if (this.theme != "base") {
				dom.addCss("widgets/jQueryUIDateTimePicker/widget/ui/jquery-ui-" + this.theme + ".css");
			}
        },

        // mxui.widget._WidgetBase.update is called when context is changed or initialized. Implement to re-render and / or fetch data.
        update: function update(obj, callback) {
            logger.debug(this.id + ".update");
            this._contextObj = obj;
			// set default date of DatePicker (set here, instead of in setParams, because we don't have a contextobject there yet)
			var defaultDate = '';
			if (this.defaultDateStr) {
				defaultDate = this.defaultDateStr;
			}
			if (this.defaultDateAttr && this._contextObj){
				defaultDate = this._contextObj.get(this.defaultDateAttr);
			}
			$(this._datePicker).datepicker( "option", "defaultDate", defaultDate);
			
			//update datepicker with value
            this._updateDatepicker(this._datePicker, obj.get(this.dateAttribute));
            this._resetSubscriptions();
            callback();
        },

        // mxui.widget._WidgetBase.uninitialize is called when the widget is destroyed. Implement to do special tear-down work.
        uninitialize: function uninitialize() {
            logger.debug(this.id + ".uninitialize");
            if (this._handle) {
                this.unsubscribe(this._handle);
                this._handle = null;
            }
        },

        _triggerFocus: function _triggerFocus(element) {
            logger.debug(this.id + "._triggerFocus4");
			//trigger focus after delay to prevent weird bug with slider buttons
			if (this.addSliderButtons) {
				setTimeout(function(){
					$(element).trigger("focus");
				}, 200);
			} else {
				$(element).trigger("focus");
			}
        },

        _setParams: function _setParams(dateFormat, timeFormat) {
            logger.debug(this.id + "._setParams");
			var self = this;
            var params = {
                showButtonPanel: this.showButtonBar,
                onSelect: function(date, i) {
					if (date !== i.lastVal) {
					/* jQueryUIDateTimePicker doesn't trigger onchange event
					   so we must trigger it manually in the onSelect function */
						dojoOn.emit(this, "change", {
							bubbles: false,
							cancelable: true
						});
					}

                    /* fix buggy IE focus functionality */
					/* https://bugs.jqueryui.com/ticket/9125 */
					if (self.pickerType === "DatePicker") {
						var isIE = self._isIE();
						if (isIE){
							$(this).datepicker("disable");
							window.setTimeout(function(element) {
								$(element).datepicker("enable");
							}.bind(null, this), 500);
						}
					}
                },
				beforeShow: function () {
					$('#ui-datepicker-div').unwrap();
					if (self.theme != "base") {
						$('#ui-datepicker-div').wrap( "<div></div>" ).parent().addClass('theme-' + self.theme);
					}
				}
            };

            if (this.pickerType === "DatePicker" || this.pickerType === "DateTimePicker") {
                params.changeMonth = this.showMonthYearMenu;
                params.changeYear = this.showMonthYearMenu;
                params.yearRange = this.yearRange === "" ? "-100:+100" : this.yearRange;
                params.showWeek = this.showWeekNr;
				params.dateFormat = dateFormat;
				if (this.firstDay !== "Default") {
					params.firstDay = this.firstDay === "Monday" ? 1 : this._seven;
				}
            }

            if (this.pickerType === "TimePicker" || this.pickerType === "DateTimePicker") {
                params.timeInput = true;
                params.minTime = this.minTime === "" ? null : this.minTime;
                params.maxTime = this.maxTime === "" ? null : this.maxTime;
				params.timeFormat = timeFormat;
                params.addSliderAccess = this.addSliderButtons;
				if (this.addSliderButtons) {
					params.sliderAccessArgs = { touchonly: false };
				}
				
            }
            this.params = params;

        },

		_isIE: function _isIE() {
			var ua = window.navigator.userAgent;
			var msie = ua.indexOf("MSIE ");

			if (msie > 0 || !! ua.match(/Trident.*rv\:11\./)) {
				return true;
			} else { 
				return false;
			}
			return false;

        },


        _updateDatepicker: function _updateDatepicker(element, value) {
            logger.debug(this.id + "._updateDatepicker");
            if (value) {
                var date = new Date(value);
                $(element).datepicker("setDate", date);
            }
        },

        _onChange: function _onChange(datePickerElement) {
            logger.debug(this.id + "._onChange");
            var myDate = $(datePickerElement).datepicker("getDate");
            if (myDate) {
                this._contextObj.set(this.dateAttribute, myDate);
                if (this.onChangeMicroflow.length > 0) {
                    this._runMicroflow(this._contextObj, this.onChangeMicroflow);
                } else if (this.onChangeNanoflow.nanoflow.length > 0) {
                    this._runNanoflow(this._contextObj, this.onChangeNanoflow);
				}
            } else {
                this._contextObj.set(this.dateAttribute, "");
            }
        },

        _addValidation: function _addValidation(message) {
            logger.debug(this.id + "._showValidation");
            if (this._alertDiv !== null) {
                dojoHtml.set(this._alertDiv, message);
                return;
            }
            this._alertDiv = dojoConstruct.create("div", {
                class: "alert alert-danger",
                innerHTML: message
            });
            dojoConstruct.place(this._alertDiv, this.domNode);
        },

        _clearValidations: function _clearValidations() {
            logger.debug(this.id + "._clearValidations");
            dojoConstruct.destroy(this._alertDiv);
            $(this.domNode).removeClass("has-error");
            this._alertDiv = null;
        },

        _handleValidation: function _handleValidation(validations) {
            logger.debug(this.id + "._handleValidation");
            this._clearValidations();

            var validation = validations[0],
                message = validation.getReasonByAttribute(this.dateAttribute);

            if (this._readOnly) {
                validation.removeAttribute(this.dateAttribute);
            } else if (message) {
                $(this.domNode).addClass("has-error");
                this._addValidation(message);
                validation.removeAttribute(this.dateAttribute);
            }
        },

        _setupEvents: function _setupEvents() {
            this.connect(this._datePickerButton, "click", this._triggerFocus.bind(this, this._datePicker));
            this.connect(this._datePicker, "change", this._onChange.bind(this, this._datePicker));
        },

        _handleObjectSubscription: function(guid) {
            this._updateDatepicker(this._datePicker, this._contextObj.get(this.dateAttribute));
        },

        _handleAttrSubscription: function(guid, attr, value) {
            if (value) {
                this._updateDatepicker(this._datePicker, value);
            }
        },

        _resetSubscriptions: function _resetSubscriptions() {
            // Release handles on previous object, if any.
            this.unsubscribeAll();
            // Assign new handles if an object exists.
            if (this._contextObj) {
                this.subscribe({
                    guid: this._contextObj.getGuid(),
                    callback: this._handleObjectSubscription.bind(this)
                });
                this.subscribe({
                    guid: this._contextObj.getGuid(),
                    attr: this.dateAttribute,
                    callback: this._handleAttrSubscription.bind(this)
                });
                this.subscribe({
                    guid: this._contextObj.getGuid(),
                    val: true,
                    callback: this._handleValidation.bind(this)
                });
            }
        },

        _runMicroflow: function _runMicroflow(obj, mf, cb) {
            if (mf) {
                var parameters = {
                    origin: this.mxform,
                    params: {
                        actionname: mf,
                        applyto: "selection",
                        guids: []
                    },
                    callback: function(objects) {
                        if (cb) {
                            cb(objects);
                        }
                    },
                    error: function error(errorObject) {
                        if (cb) {
                            cb();
                        }
                        /*
                            When used asynchronous the feedback validations are causing an call to this error function.
                            We don't need this behaviour in this widget since validations are already handled.
                        */
                        if (errorObject.message.indexOf("validation error") === -1) {
                            mx.ui.error("Error executing microflow " + mf + " : " + errorObject.message);
                        }
                    }
                };
                if (this.onChangeMicroflowProgress === true) {
                    parameters.progress = "modal";
                }
                if (this.onChangeMicroflowProgressMsg !== "") {
                    parameters.progressMsg = this.onChangeMicroflowProgressMsg;
                }
                if (this.onChangeMicroflowAsync === true) {
                    parameters.async = this.onChangeMicroflowAsync;
                }
                if (obj) {
                    parameters.params.guids = [ obj.getGuid() ];
                }
                mx.ui.action(mf, parameters, this);
            } else if (cb) {
                cb();
            }
        },
		_runNanoflow: function _runNanoflow(obj, nf) {
            if (nf) {
                mx.data.callNanoflow({
                    nanoflow: nf,
                    origin: this.mxform,
                    context: this.mxcontext,
                    error: function error(errorObject) {
                         mx.ui.error("Error executing nanoflow " + nf + " : " + errorObject.message);
                    }
                });
            }
        }
    });
});
require([ "jQueryUIDateTimePicker/widget/jQueryUIDateTimePicker" ]);
