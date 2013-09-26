/**
 *
 * jQuery Vent Form plugin
 * $('.form').formValidation();
 *
 * Options:
 * - username: ID or Class of the field for the users name e.g. '#full_name'.
 * - validationMessage: Class of the field that contains the validation message e.g. 'validationMessage'.
 * - requireClass: Class for required fields e.g. 'required'.
 * - emailClass: Class for email fields e.g. 'email'.
 * - passClass: Class for password fields e.g. 'pass'.
 * - passConfirmClass: Class for password confirm field e.g. 'pass_confirm'.
 * - errorClass: Class to add to each field.
 * - errorBoxClass: Class of the box to display the error message in e.g. 'val_box'.
 * - otherMessages: Class or ID of an element that contains server side messages you might want to hide with this plugin.
 * - statusMessagesClass: Class of the box to apply to the JavaScript status messages box 'js_status_message'.
 * - emailRegEx: Default RegEx to check against email addresses.
 * - passRegEx: Default RegEx to check against passwords.
 * - consecutiveErrors: Boolean to enable whether all errors should show at once or consecutively.
 * - appendErrorToTitle: Boolean to enable whether the error should be appended to the field label or not.
 * - saveInputs: Boolean to enable localStorage.
 * - ajaxMode: Boolean. If true will post the URL provided in the "action" attribute with Ajax.
 * - formSuccessMsgID: ID of the form field that holds the success message. Not required if defaultSuccessMsg is set.
 * - defaultErrorMsg: A default error message if one isn't set.
 * - defaultSuccessMsg: A message to display to the user when the form has been submitted. Requires ajaxMode to be true.
 * - dataURL: String. The URL or valid jQuery selector of a URL to post the data to. Requires ajaxMode to be true.
 * - successFunction: A function to pass when the form is validated. Requires ajaxMode to be true.
 *
**/

;(function($, window, document, undefined){
    'use strict';

    $.fn.formValidation = function(options){
        /* -- Defaults -- */
        // Our application defaults
        var defaults = {
            username            : '#full_name',
            validationMessage   : 'validationMessage',
            requireClass        : 'required',
            emailClass          : 'email',
            passClass           : 'pass',
            passConfirmClass    : 'pass_confirm',
            errorClass          : 'alert error',
            errorBoxClass       : 'val-box',
            otherMessages       : '.status-messages',
            statusMessagesClass : 'js-status-message',
            emailRegEx          : /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/,
            passRegEx           : /^.*(?=.{8,})(?=.*[0-9])[a-zA-Z0-9]+$/,
            showErrorMsg        : true,
            consecutiveErrors   : true,
            appendErrorToTitle  : true,
            saveInputs          : true,
            ajaxMode            : true,
            formSuccessMsgID    : '#success_message',
            defaultErrorMsg     : 'Please enter a value',
            defaultSuccessMsg   : 'You have successfully submitted the form',
            dataURL             : '',
            successFunction     : null
        };

        /* -- Settings -- */
        // Combine the defaults and custom settings
        var settings = $.extend({}, defaults, options);

        /* -- Utilities -- */
        $.fn.fn_error = function(method){
            var methods = {
                on: function(){
                    this.each(function(){
                        $(this).addClass(settings.errorClass);
                    });
                    setTimeout(function(){
                        //this.fn_error('off');
                    }, 1000);
                    return this;
                },
                off: function(){
                    this.each(function(){
                        $(this).removeClass(settings.errorClass);
                    });
                    return this;
                },
                clear: function(){
                    this.each(function(){
                        localStorage.removeItem($(this).attr('name'));
                    });
                    return this;
                }
            };
            if(methods[method]){
                return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
            }
            else if(typeof method === 'object' || !method){
                return methods.on.apply(this, arguments);
            }
            else{
                $.error('Method ' +  method + ' does not exist on jQuery.fn_error');
            }
        }

        // Center any element
        $.fn.fn_center = function(method, element){
            var el      = (element != null) ? $(element) : $(window);
            var methods = {
                all: function(){
                    el.css('position', 'relative');
                    this.css('position', 'absolute');
                    this.css('top', ((el.height() - this.outerHeight()) / 2) + el.scrollTop() + 'px');
                    this.css('left', ((el.width() - this.outerWidth()) / 2) + el.scrollLeft() + 'px');
                    return this;
                },
                vertical: function(){
                    el.css('position', 'relative');
                    this.css('position', 'absolute');
                    this.css('top', ((el.height() - this.outerHeight()) / 2) + el.scrollTop() + 'px');
                    return this;
                },
                horizontal: function(){
                    el.css('position', 'relative');
                    this.css('position', 'absolute');
                    this.css('left', ((el.width() - this.outerWidth()) / 2) + el.scrollLeft() + 'px');
                    return this;
                }
            }
            if(methods[method]){
                return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
            }
            else if(typeof method === 'object' || !method){
                return methods.all.apply(this, arguments);
            }
            else{
                $.error('Method ' +  method + ' does not exist on jQuery.center');
            }
        }
        if(!Array.prototype.indexOf){
            Array.prototype.indexOf = function(obj, fromIndex){
                if(fromIndex == null){
                    fromIndex = 0;
                }
                else if(fromIndex < 0){
                    fromIndex = Math.max(0, this.length + fromIndex);
                }
                for(var i = fromIndex, j = this.length; i < j; i++){
                    if(this[i] === obj)
                        return i;
                }
                return -1;
            };
        }

        var utils = {
            loadingAnimation: function(el, size, color){
                $.getScript('http://heartcode-canvasloader.googlecode.com/files/heartcode-canvasloader-min-0.9.js', function(){
                    var loader = new CanvasLoader(el);
                    loader.setShape('spiral');
                    loader.setDiameter(size);
                    loader.setDensity(13);
                    loader.setRange(0.6);
                    loader.setSpeed(1);
                    loader.setColor(color);
                    loader.show();
                });
            }
        }

        return this.each(function(){
            var plg = $(this);

            /* -- App methods -- */
            var app = {
                init: function(){
                    plg.attr('novalidate', 'novalidate');

                    $(settings.otherMessages).hide();
                    this.error_numeric = 'Must be a number';
                    this.form_action   = (settings.dataURL) ? settings.dataURL : plg.attr('action');

                    this.cacheElements();
                    this.createElements();
                },
                cacheElements: function(){
                    this.status_messages = $('<div class="' + settings.statusMessagesClass + '"></div>');
                    this.errorBox        = $('<span class="' + settings.errorBoxClass + '"></span>');
                },
                createElements: function(){
                    plg.before(this.status_messages);
                },
                initForm: function(){
                    this.validated   = true;
                    this.enquiryname = $(settings.username, plg).val();
                    try{
                        this.successMsg = $(settings.formSuccessMsgID, plg).val().replace('[name]', this.enquiryname);
                    }
                    catch(e){
                        this.successMsg = settings.defaultSuccessMsg;
                    }
                    // Remove the error box
                    this.errorBox.empty().remove();
                    $('.' + settings.errorBoxClass).empty().remove();

                    // Create an error Array
                    this.errorArray = [];
                },
                getLocalStorage: function(){
                    $('input, select, textarea', plg).each(function(){
                        var inputID = $(this).attr('name');
                        if(localStorage[inputID]){
                            if($(this).is('select')){
                                $('option[selected="selected"]', this).removeAttr('selected');
                                $('option[value="' + localStorage[inputID] + '"]', this).prop('selected', true);
                            }
                            else if($(this).is('input[type="radio"]')){
                                if($(this).val() == localStorage[inputID])
                                    $(this).prop('checked', true);
                            }
                            else if($(this).is('input[type="checkbox"]')){
                                var checkboxes = localStorage[inputID].split(',');
                                $('input[name="' + inputID + '"]').each(function(i){
                                    if(checkboxes[i] != '' && $(this).val() == checkboxes[i])
                                        $(this).prop('checked', true);
                                });
                            }
                            else{
                                $(this).val(localStorage[inputID]);
                            }
                        };
                    });
                },
                resetForm: function(){
                    $('.' + settings.errorBoxClass, plg).remove();
                    $('option[selected="selected"]', plg).removeAttr('selected');
                    $('input, select, textarea, label', plg).removeClass(settings.errorClass).fn_error('clear').removeAttr('selected');
                },
                addToError: function(element){
                    element.fn_error('on');
                    var id = element.attr('id');
                    if(this.errorArray.indexOf(id) == -1){
                        this.errorArray.push(id);
                    }
                },
                displayErrors: function(){
                    if(this.errorArray.length > 0){
                        app.validated = false;
                        $.each(this.errorArray, function(i){
                            // Dont use $(this)
                            var field = $('#' + app.errorArray[i], plg);

                            if(field.is('input[type="checkbox"]') || field.is('input[type="radio"]')){
                                var labelField = field.parent().parent().find('.label');
                                var valfield   = field.parent().parent().find('.' + settings.validationMessage);
                                var valmessage = (valfield.length) ? valfield.val() || valfield.text() : settings.defaultErrorMsg;
                            }
                            else{
                                var labelField = field.parent().find('label');
                                var valfield   = field.parent().find('.' + settings.validationMessage);
                                var valmessage = (valfield.length) ? valfield.val() || valfield.text() : settings.defaultErrorMsg;
                            }

                            if(settings.showErrorMsg){
                                if(settings.consecutiveErrors){
                                    if(!i){
                                        // Set the error message
                                        app.errorBox.text(valmessage);
                                        // Add the error box.
                                        if(settings.appendErrorToTitle){
                                            app.errorBox.prepend(' - ');
                                            labelField.append(app.errorBox);
                                        }
                                        else {
                                            field.parent().prepend(app.errorBox);
                                        }
                                        // Fade in the error box.
                                        app.errorBox.fadeIn(500);
                                        // Focus on the field.
                                        field.focus();
                                    }
                                }
                                else {
                                    // Add the error box.
                                    if(settings.appendErrorToTitle){
                                        labelField.append('<span class="' + settings.errorBoxClass + '"></span>');
                                        // Set the error message
                                        $('.' + settings.errorBoxClass).text(' - ' + valmessage);
                                    }
                                    else {
                                        field.parent().prepend('<span class="' + settings.errorBoxClass + '"></span>');
                                        // Set the error message
                                        $('.' + settings.errorBoxClass).text(' - ' + valmessage);
                                    }
                                    // Fade in the error box.
                                    $('.' + settings.errorBoxClass).fadeIn(500);
                                }
                            }
                        });
                    }
                },
                checkhttp: function(element){
                    var value = element.val();
                    if(value != '' && value.indexOf('http://') == -1){
                        element.val('http://' + value);
                    }
                },
                formValidated: function(){
                    // Disable the buttons
                    $('button', plg).attr('disabled', 'disabled');

                    // Generate a random int for a unique loader ID
                    var rn = Math.random() * (100 - 1) + 1;
                    app.buttonName = $('button[type="submit"]', plg).text();
                    $('button[type="submit"]', plg).html('<div id="loader-' + rn + '"></div>');
                    $('#loader').fn_center('all');
                    utils.loadingAnimation('loader-' + rn, 13, '#333');

                    // Hide status messages
                    this.status_messages.hide();
                    // Remove the error message box
                    this.errorBox.remove();
                }
            }

            /* -- Initialise the app -- */
            app.init();

            /* -- LocalStorage -- */
            // Save inputs
            if(settings.saveInputs && typeof(Storage) !== 'undefined'){
                app.getLocalStorage();
                $('input, select, textarea', plg).change(function(){
                    var inputID = $(this).attr('name');
                    if($(this).is('input[type="checkbox"]')){
                        var checkboxArray = [];
                        $('input[name="' + inputID + '"]').each(function(i){
                            if($(this).is(':checked')){
                                checkboxArray.push($(this).val());
                            }
                            else if($(this).is('select')){
                                localStorage[inputID] = $('option:selected', this).val();
                            }
                            else{
                                checkboxArray.push('');
                            }
                        });
                        localStorage[inputID] = checkboxArray;
                    }
                    else{
                        localStorage[inputID] = $(this).val();
                    }
                });
            }

            /* -- OnLoad Functions -- */
            $(function(){
                /* -- Hide status messages for JS users -- */
                if($('.status_messages').length){
                    $('.status_messages').hide();
                }

                /* -- Hide validation messages -- */
                if($('.' + settings.validationMessage).length){
                    $('.' + settings.validationMessage).hide();
                }

                /* -- Add required class to label of each form -- */
                $(settings.requireClass, plg).each(function(){
                    $(this).parent().find('label, .label').addClass('required');
                });

                /* -- URL Fields -- */
                $('input[type="url"]', this).each(function(){
                    $(this).on('blur', function(){
                        app.checkhttp($(this));
                    });
                });

                /* -- Resetting the form -- */
                $('button[type="reset"], input[type="reset"]', plg).on('click', function(){
                    app.resetForm();
                });
            });

            /* -- Submitting the form -- */
            plg.on('submit', function(){
                app.initForm();

                // Create an array for checkboxes and radio inputs
                var groupArray = [];

                /* -- Cycling through the fields in order -- */
                $('.' + settings.requireClass + ',.' + settings.emailClass + ',.' + settings.passClass + ',.' + settings.passConfirmClass, this).each(function(){
                    // Required fields
                    if($(this).hasClass(settings.requireClass) && $(this).val().length == 0 || $(this).val() == undefined){
                        app.addToError($(this));
                    }
                    // Email fields
                    else if($(this).hasClass(settings.emailClass) && !settings.emailRegEx.test($(this).val())){
                        app.addToError($(this));
                    }
                    // Password fields
                    else if($(this).hasClass(settings.passClass) && !settings.regPass.test($(this).val())){
                        app.addToError($(this));
                    }
                    // Password confirmation fields
                    else if($(this).hasClass(settings.passConfirmClass) && $(this).val() !== $('input.' + settings.passClass).val()){
                        app.addToError($(this));
                    }
                    // Radio & Checkbox fields
                    else if($(this).hasClass(settings.requireClass) && $(this).is('input[type="radio"]') || $(this).is('input[type="checkbox"]')){
                        var groupName = $(this).attr('name');

                        var field = $('input[name="' + groupName + '"]');
                        if(field.serializeArray().length == 0){
                            $(this).fn_error('on').parent().parent().find('.label, label').fn_error('on');
                            var id = field.attr('id');
                            if(app.errorArray.indexOf(id) == -1){
                                app.errorArray.push(id);
                            }
                        }
                        else{
                            $(this).fn_error('off').parent().parent().find('.label, label').fn_error('off');
                        }
                    }
                    // Else
                    else{
                        $(this).fn_error('off');
                    }
                });

                /* -- Cycle through the errors -- */
                app.displayErrors();

                /* -- Post this mutha -- */
                if(app.validated){
                    // Run the form validation
                    app.formValidated();
                    // If we are posting with Ajax:
                    if(settings.ajaxMode){
                        // If we have a custom post function
                        if($.isFunction(settings.successFunction)){
                            settings.successFunction();
                        }
                        // Default Ajax function
                        else{
                            // Create the AJAX post
                            $.ajax({
                                type: 'POST',
                                url: app.form_action,
                                data: plg.serialize(),
                                success: function(){
                                    // Fade out the form
                                    plg.hide();
                                    // Fill the JS status messages and fade in
                                    app.status_messages.html('<p>' + app.successMsg + '</p>').fadeIn(500);
                                    // Clear all localStorage data from the form
                                    $('input, textarea, select', plg).fn_error('clear');
                                },
                                error: function(xhr, ajaxOptions, thrownError){
                                    alert('Failure');
                                    $('button', plg).removeAttr('disabled');
                                    $('button[type="submit"]', plg).html(app.buttonName);
                                }
                            });
                        }
                    }
                    // No Ajax
                    else {
                        // Clear all localStorage data from the form
                        $('input, textarea, select', plg).fn_error('clear');
                        // Allow the form to post
                        return true;
                    }
                }
                return false;
            });

        });
    };

    /* -- Email Suggester -- */
    $(function(){
        $('.email, input[type="email"]').each(function(){
            var suggestion = $('<div class="suggestion">Did you mean <a href="#" class="alternate_email"><span class="toplevel">something</span>@<span class="dom">yourdomain.com</span></a>?</div>');
            $(this).after(suggestion.hide());
        });
        if(EMAIL !== undefined && EMAIL.emailsuggest !== undefined){
            if(EMAIL.emailsuggest.init !== undefined){
                EMAIL.emailsuggest.init();
            }
            if(EMAIL.emailsuggest.query !== undefined && EMAIL.emailsuggest.query.init !== undefined){
                EMAIL.emailsuggest.query.init();
            }
        }
    });
    var lib = {};
    var EMAIL = {
        Models: {},
        Collections: {}
    };
    lib.validators = {
        emailDomainSuggester: function(a){
            var b = new Array(
                "aol.com",
                "bellsouth.net",
                "btinternet.com",
                "btopenworld.com",
                "blueyonder.co.uk",
                "comcast.net",
                "cox.net",
                "gmail.com",
                "google.com",
                "googlemail.com",
                "hotmail.co.uk",
                "hotmail.com",
                "hotmail.fr",
                "hotmail.it",
                "icloud.com",
                "live.com",
                "mac.com",
                "mail.com",
                "me.com",
                "msn.com",
                "o2.co.uk",
                "orange.co.uk",
                "outlook.com",
                "outlook.co.uk",
                "sbcglobal.net",
                "verizon.net",
                "virginmedia.com",
                "yahoo.com",
                "yahoo.co.uk",
                "yahoo.com.tw",
                "yahoo.es",
                "yahoo.fr"
            );
            var c = a.split("@");
            var d;
            var e = 99;
            var f = null;
            for(var g = 0; g < b.length; g++){
                d = this.stringDistance(b[g], c[1]);
                if(d < e){
                    e = d;
                    f = b[g]
                }
            }
            if(e <= 2 && f !== null && f !== c[1]){
                return{
                    address: c[0],
                    domain: f
                }
            }
            else{
                return false
            }
        },
        stringDistance: function(a, b){
            if(a == null || a.length === 0){
                if(b == null || b.length === 0){
                    return 0
                }
                else{
                    return b.length
                }
            }
            if(b == null || b.length === 0){
                return a.length
            }
            var c = 0;
            var d = 0;
            var e = 0;
            var f = 0;
            var g = 5;
            while(c + d < a.length && c + e < b.length){
                if(a[c + d] == b[c + e]){
                    f++
                }
                else{
                    d = 0;
                    e = 0;
                    for(var h = 0; h < g; h++){
                        if(c + h < a.length && a[c + h] == b[c]){
                            d = h;
                            break
                        }
                        if(c + h < b.length && a[c] == b[c + h]){
                            e = h;
                            break
                        }
                    }
                }
                c++
            }
            return (a.length + b.length) / 2 - f
        }
    };
    EMAIL.emailsuggest = {
        query: {
            init: function(){
                this.suggestedEmail = null;
                $('.email, input[type="email"]').on('blur', this.suggestEmail);
                $('.suggestion .alternate_email').on('click', this.fillInSuggestedEmail);
            },
            suggestEmail: function(a){
                var b = $(this).val();
                var c = lib.validators.emailDomainSuggester(b);
                var d = $(this).parent().find('.suggestion');
                var e = $('.toplevel', d);
                var f = $('.dom', d);
                if(c){
                    e.html(c.address);
                    f.html(c.domain);
                    EMAIL.emailsuggest.query.suggestedEmail = c;
                    d.slideDown(500);
                }
                else{
                    EMAIL.emailsuggest.query.suggestedEmail = null;
                    d.slideUp(500);
                }
            },
            fillInSuggestedEmail: function(e, a){
                e.preventDefault();
                var b = EMAIL.emailsuggest.query.suggestedEmail;
                if(b){
                    $(this).parent().parent().find('.email').val(b.address + '@' + b.domain);
                    $(this).parent('.suggestion').slideUp(500)
                }
            }
        }
    }

})(jQuery, window, document);
