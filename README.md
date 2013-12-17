# jQuery Form Validation
### By Stew Dellow | [hellostew.com](http://hellostew.com/ "Creative Web Developer")

## About
Adds some very customisable, nifty jQuery validation to your forms and allows you to post the form with Ajax (entirely optional!).

Works with all types of inputs, but specifically: `text`, `textarea`, `email`, `select`, `radio`, `checkbox`

Please see `example.html` for some, er, example markup!

## Features
- Ajax post (Optional).
- Customised validation messages for each field, or just one generic message for all.
- LocalStorage saving. Automatically saves every field in the users localStorage so if they occidentally navigate away from the page their entries will still appear. LocalStorage is purged on successful sending or reset of the form.
- Email & Password pattern checking or use your own RegEx.
- Email domain checker. Checks against an array of popular email domains and prompts the user for spelling mistakes. No more 'htmail.com'!

## Options
- __username__
	- Type: _String (ID or Class of valid element)_
	- Default: `'#full_name'`
	- Description: Used to display the users name on successful send of the form.

- __validationMessage__
	- Type: _String (Class of valid element)_
	- Default: `'val-message'`
	- Description: Used to target the element that holds the validation message.

- __requireClass__
	- Type: _String (Class of valid element)_
	- Default: `'required'`
	- Description: Class to identify a required field.

- __emailClass__
	- Type: _String (Class of valid element)_
	- Default: `'email'`
	- Description: Class to identify an email field.

- __passClass__
	- Type: _String (Class of valid element)_
	- Default: `'pass'`
	- Description: Class to identify a password field.

- __passConfirmClass__
	- Type: _String (Class of valid element)_
	- Default: `'pass_confirm'`
	- Description: Class to identify a password confirmation field.

- __errorClass__
	- Type: _String_
	- Default: `'alert error'`
	- Description: A class or list of classes to apply to an invalid field for custom styling.

- __errorBoxClass__
	- Type: _String (Class of valid element)_
	- Default: `'val_box'`
	- Description: Class of the box to generate an error message for custom styling.

- __otherMessages__
	- Type: _String (ID or Class of valid element)_
	- Default: `'.status-messages'`
	- Description: Class or ID of an element that contains server side messages you might want to hide while this plugin is active.

- __statusMessagesClass__
	- Type: _String_
	- Default: `'js-status-message'`
	- Description: Class of the box to apply to the JavaScript status messages box.

- __emailRegEx__
	- Type: _RegEx_
	- Default: `/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/`
	- Description: A RegEx pattern to check for valid email addresses.

- __passRegEx__
	- Type: _RegEx_
	- Default: `/^.*(?=.{8,})(?=.*[0-9])[a-zA-Z0-9]+$/`
	- Description: A RegEx pattern to check for valid passwords.

- __showErrorMsg__
	- Type: _Boolean_
	- Default: `true`
	- Description: Toggle whether an error message should be shown at all.

- __consecutiveErrors__
	- Type: _Boolean_
	- Default: `true`
	- Description: Toggle whether all errors should show at once or consecutively.

- __appendErrorToTitle__
	- Type: _Boolean_
	- Default: `true`
	- Description: Toggle whether the error should be appended to the field label or not.

- __saveInputs__
	- Type: _Boolean_
	- Default: `true`
	- Description: If enabled form values will instantly be saved to localStorage to allow a user to navigate away from the page. On successful send or form reset the localStorage is purged.

- __ajaxMode__
	- Type: _Boolean_
	- Default: `true`
	- Description: If true the form will post the URL provided in the "action" attribute with Ajax.

- __formSuccessMsgID__
	- Type: _String (ID or Class of valid element)_
	- Default: `'#success_message'`
	- Description: Used to target the form field that holds the success message. Not required if defaultSuccessMsg is set.

- __defaultErrorMsg__
	- Type: _String_
	- Default: `"Please enter a value"`
	- Description: A default error message if one isn't set.

- __defaultSuccessMsg__
	- Type: _String_
	- Default: `"You have successfully submitted the form"`
	- Description: A message to display to the user when the form has been submitted. Requires ajaxMode to be true.

- __defaultSuggestText__
	- Type: _String_
	- Default: `"Did you mean"`
	- Description: A message to show if the email suggester finds a result.

- __dataURL__
	- Type: _String_
	- Default: `''`
	- Description: The URL or valid jQuery selector of a URL to post the data to. Requires ajaxMode to be true.

- __successFunction__
	- Type: _Function_
	- Default: `null`
	- Description: A function to pass when the form is validated. Requires ajaxMode to be true.

## Changelog
*  `v. 1.0.0`
