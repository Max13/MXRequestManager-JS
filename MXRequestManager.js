function MXRequestManager (method, target, data, httpUser, httpPass)
{
	if (this.constructor.name == 'Window')
		throw "MXRequestManager Error: I have to be called with the 'new' keyword";

	if (typeof (jQuery) == 'undefined')
		throw 'MXRequestManager Error: jQuery is undefined';

	this.libName = 'MXRequestManager';
	this.eventName = null;
	this.loadType = null;
	this.method = null;
	this.target = null;
	this.data = null;
	this.httpUser = null;
	this.httpPass = null;
	this.ready = false;
	this.before = null;
	// -- //
	this.finished = false;
	this.response = {};

	if (typeof (this.init) == 'undefined')
	{
		MXRequestManager.prototype.construct = function (method, target, data, httpUser, httpPass) {
			if (typeof (method) != 'string' || // Required
				(typeof (target) != 'string' &&
				 typeof (target) != 'undefined') ||
				(typeof (data) != 'object' &&
				 typeof (data) != 'string' &&
				 typeof (data) != 'undefined') ||
				(typeof (httpUser) != 'string' &&
				 typeof (httpUser) != 'undefined') ||
				(typeof (httpPass) != 'string' &&
				 typeof (httpPass) != 'undefined'))
				return (this);

			if (method.charAt(0) == '#') // method is a form_id
			{
				this.loadType = 'form';

				var form = $(method);

				this.method = (typeof (form.attr('method')) == 'undefined') ? 'GET' : form.attr('method');
				this.target = (typeof (form.attr('action')) == 'undefined') ? '#' : form.attr('action');
				this.data = form.serialize();
				this.httpUser = (typeof (target) == 'undefined') ? '' : target;
				this.httpPass = (typeof (data) == 'undefined') ? '' : data;
			}
			else // method is
			{
				this.loadType = 'input';

				this.method = method.toUpperCase();
				this.target = target;
				this.data = (typeof (data) == 'undefined') ? '' : data;
				this.httpUser = (typeof (httpUser) == 'undefined') ? '' : httpUser;
				this.httpPass = (typeof (httpPass) == 'undefined') ? '' : httpPass;
			}

			this.eventName = this.libName+'Done';
			this.ready = true;
			return (this);
		};

		MXRequestManager.prototype.setMethod = function (name) {
			this.method = name.toUpperCase();
			return (this);
		};

		MXRequestManager.prototype.setEventName = function (name) {
			this.eventName = this.libName+'Done'+name;
			return (this);
		};

		MXRequestManager.prototype.setBefore = function (name) {
			this.before = name;
			return (this);
		};

		MXRequestManager.prototype.submit = function () {
			if (this.before != null)
				if (!eval(this.before+'()'))
				{
					errorMessage('Error: No connectivity');
					if (this.loadType == 'input')
						history.go(-1);
					return (false);
				}

			jQuery.ajax({
				username	: this.httpUser,
				password	: this.httpPass,
				cache		: false,
				context		: this,
				crossDomain	: true,
				data		: this.data,
				type		: this.method,
				url			: this.target
			}).always(function(data, status, jqXHR) {
				console.log(arguments);

				this.finished = true;
				if (status == 'success')
				{
					this.response = data;
					this.response._raw = jqXHR;
				}
				else// if (status == 'error')
				{
					this.response = JSON.parse(data.responseText);
					this.response._raw = data;
				}
				this.response._status = status;
				this.response._httpCode = this.response._raw.status;

				console.log(this);

				$(document).trigger(this.eventName);
			});

			return (this);
		};

		this.init = true;
	}

	this.construct(method, target, data, httpUser, httpPass);
	/*
	if (this.ready)
		this.submit();
	*/
	return (this);
};