/**
 *
 * jQuery Form Validation plugin
 * $('.form').formval();
 *
 * Options:
 * - username: ID or Class of the field for the users name e.g. '#fullname'.
 * - validationMessage: ID or Class of the field that contains the validation message e.g. '.validationMessage'.
 * - requireClass: Class or ID for required fields e.g. '.required'.
 * - emailClass: Class or ID for email fields e.g. '.email'.
 * - passClass: Class or ID for password fields e.g. '.pass'.
 * - passConfirmClass: Class or ID for password confirm field e.g. '.pass_confirm'.
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
 * - formSuccessMsgID: ID of the form field that holds the success message. Not requried if defaultSuccessMsg is set.
 * - defaultSuccessMsg: A message to display to the user when the form has been submitted. Requires ajaxMode to be true.
 * - dataURL: String. The URL or valid jQuery selector of a URL to post the data to. Requires ajaxMode to be true.
 * - successFunction: A function to pass when the form is validated. Requries ajaxMode to be true.
 *
**/

;(function($, window, document, undefined){
    'use strict';

    $.fn.formval = function(options){
        /* -- Defaults -- */
        // Our application defaults
        var defaults = {
            username            : '#fullname',
            validationMessage   : '.val-message',
            requireClass        : '.required',
            emailClass          : '.email',
            passClass           : '.pass',
            passConfirmClass    : '.pass_confirm',
            errorClass          : 'alert error',
            errorBoxClass       : 'val-box',
            otherMessages       : '.status-messages',
            statusMessagesClass : 'js-status-message',
            emailRegEx          : /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/,
            passRegEx           : /^.*(?=.{8,})(?=.*[0-9])[a-zA-Z0-9]+$/,
            consecutiveErrors   : true,
            appendErrorToTitle  : true,
            saveInputs          : true,
            ajaxMode            : true,
            formSuccessMsgID    : '#success_message',
            defaultSuccessMsg   : 'You have successfully submitted the form',
            dataURL             : '',
            successFunction     : function(){}
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

        return this.each(function(){
            var plg = $(this);

            /* -- App methods -- */
            var app = {
                init: function(){
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
                    this.errorBox.remove();

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
                            var field      = $('#' + app.errorArray[i], plg);

                            if(field.is('input[type="checkbox"]') || field.is('input[type="radio"]')){
                                var labelField = field.parent().parent().find('.label');
                                var valfield   = field.parent().parent().find(settings.validationMessage);
                            }
                            else{
                                var labelField = field.parent().find('label');
                                var valfield   = field.parent().find(settings.validationMessage);
                            }


                            if(settings.consecutiveErrors){
                                if(!i){
                                    // Set the error message
                                    if(valfield.is('input')){
                                        app.errorBox.text(valfield.val());
                                    }
                                    else {
                                        app.errorBox.text(valfield.text());
                                    }
                                    // Add the error box.
                                    if(settings.appendErrorToTitle){
                                        labelField.append(app.errorBox);
                                        app.errorBox.prepend(' - ');
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
                                    if(valfield.is('input')){
                                        $('.' + settings.errorBoxClass).text(' - ' + valfield.val());
                                    }
                                    else {
                                        $('.' + settings.errorBoxClass).text(' - ' + valfield.text());
                                    }
                                }
                                else {
                                    field.parent().prepend('<span class="' + settings.errorBoxClass + '"></span>');
                                    // Set the error message
                                    if(valfield.is('input')){
                                        $('.' + settings.errorBoxClass).text(valfield.val());
                                    }
                                    else {
                                        $('.' + settings.errorBoxClass).text(valfield.text());
                                    }
                                }
                                // Fade in the error box.
                                $('.' + settings.errorBoxClass).fadeIn(500);
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
                    // Hide status messages
                    this.status_messages.hide();
                    // Remove the error message box
                    this.errorBox.remove();
                    // Fade in the progress bar
                    $('button[type="submit"]', plg).addClass('bar').parent().addClass('progress progress-striped active');
                }
            }

            /* -- Initialise the app -- */
            app.init();

            /* -- LocalStorage -- */
            // Save inputs
            if(settings.saveInputs){
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
                if($('.status_messages').length) $('.status_messages').hide();
                $(settings.requireClass, plg).each(function(){
                    $(this).parent().find('label').addClass('required');
                });
                $('input[type="url"]', this).each(function(){
                    app.checkhttp($(this));
                });
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

            /* -- Submitting the form -- */
            plg.on('submit', function(){
                app.initForm();

                /* -- Required fields -- */
                $('input' + settings.requireClass + ', textarea' + settings.requireClass + ', select' + settings.requireClass, this).each(function(){
                    if($(this).val().length == 0 || $(this).val() == undefined){
                        app.addToError($(this));
                    }
                    else{
                        $(this).fn_error('off');
                    }
                });

                /* -- Email fields -- */
                $('input' + settings.emailClass, this).each(function(){
                    if(!settings.emailRegEx.test($(this).val())){
                        app.addToError($(this));
                    }
                    else{
                        $(this).fn_error('off');
                    }
                });

                /* -- Password fields -- */
                $('input' + settings.passClass, this).each(function(){
                    if(!settings.regPass.test($(this).val())){
                        app.addToError($(this));
                    }
                    else{
                        $(this).fn_error('off');
                    }
                });

                /* -- Password confirmation fields -- */
                $('input' + settings.passConfirmClass, this).each(function(){
                    if($(this).val() !== $('input.' + settings.passClass).val()){
                        app.addToError($(this));
                    }
                    else{
                        $(this).fn_error('off');
                    }
                });

                /* -- Radio & Checkbox inputs -- */
                var groupArray = [];
                $('input[type="radio"]' + settings.requireClass + ', input[type="checkbox"]' + settings.requireClass + '', this).each(function(){
                    var groupName = $(this).attr('name');
                    if($.inArray(groupName, groupArray) == -1){
                        groupArray.push(groupName);
                    }
                });
                $.each(groupArray, function(i){
                    var field = $('input[name="' + groupArray[i] + '"]').serializeArray();
                    if(field.length == 0){
                        app.validated = false;
                        $('input[name="' + groupArray[i] + '"]').fn_error('on').parent().fn_error('on').next().fn_error('on');
                        var id = $('input[name="' + groupArray[i] + '"]').attr('id');
                        if(app.errorArray.indexOf(id) == -1){
                            app.errorArray.push(id);
                        }
                    }
                    else{
                        $('input[name="' + groupArray[i] + '"]').fn_error('off').parent().fn_error('off').next().fn_error('off');
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
                        if(settings.successFunction()){
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
                                    // Fill the JS status messages and fade in
                                    app.status_messages.html('<p>' + app.successMsg + '</p>').fadeIn(500);
                                    // Fade out the form
                                    plg.fadeOut(500);
                                    // Clear all localStorage data from the form
                                    $('input, textarea, select', plg).fn_error('clear');
                                },
                                error: function(xhr, ajaxOptions, thrownError){
                                    alert('Failure')
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

})(jQuery, window, document);
