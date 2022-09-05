
; (function () {
    var config = {
        id: null,
        className: null,
        content: null,
        type: 'msg',
        msgStatus: 'success',
        title: null,
        animation: 'fade',
        content: null,
        timeout: 3000,
        skin: null,
        shadow: false,
        autoClose: true,
        closeBtn: false,
        position: 'ct',
        skin: '',
        icon: 'loading1',
        before: function () { },
        after: function () { },
        onClose: function () { },
        onShow: function () { },
        callback: function () { }
    };
    var autoCloseTimer = null;
    var init = function (options) {
        typeof options == 'undefined' ? options = {} : options;
        for (var i in config) {
            if (typeof options[i] == 'undefined') {
                options[i] = config[i]
            }
        }
        return options;
    };
    var yiqin = {
        msg: function (msg, options) {
            if (msg != '') {
                config.content = msg;
            }
            this.closeAll('msg');
            return t(msg, init(options));
        },
        alert: function (msg, options) {
            if (msg != '') {
                config.content = msg;
            }
            if (typeof options == 'undefined') {
                options = {};
            }
            options.type = 'alert';
            return t(msg, init(options));
        },
        load: function (type, options) {
            if (typeof options == 'undefined') {
                options = {};
            }
            this.closeAll('load');
            options.type = 'load';
            options.position = 'center';
            options.icon = 'loading' + type;
            options.autoClose = false;
            return t(type, init(options));
        },
        modal: function (content, options) {
            if (typeof options == 'undefined') {
                options = {};
            }
            options.type = 'modal';
            options.content = content;
            options.shadow = typeof options.shadow != 'undefined' ? options.shadow : true;
            options.position = 'center';
            this.closeAll('modal');
            return t(content, init(options));
        },
        close: function (data) {
            if (typeof data == 'undefined') {
                return false;
            }
            close(data[0], data[1]);
        },
        closeAll: function (type) {
            if (typeof type == 'undefined' || type == '') {
                var items = document.querySelectorAll('.yiqin');
            } else {
                var items = document.querySelectorAll('.yiqin.' + type);
            }
            for (var i = 0; i < items.length; i++) {
                close(items[i], init());
            }
        }
    };
    var t = function (msg, options) {
        var temp = '', id = 'yiqin-modal-item-' + document.querySelectorAll('.yiqin-modal').length;
        if (options.shadow != false) {
            var backgroundColor = 'rgba(0, 0, 0,' + (typeof options.shadow == 'boolean' ? 0.5 : options.shadow) + ')';
            temp += '<div class="yiqin-shadow" style="background-color: ' + backgroundColor + '"></div>';
        }
        options.before && options.before(this, temp, options);
        switch (options.type) {
            case 'msg':
                temp += '<div class="yiqin-modal status active' + (options.skin ? ' ' + options.skin : '') + ' ' + options.msgStatus + (options.animation ? ' ' + options.animation : '') + '" id="' + id + '">';
                var additional = '';
                if (options.closeBtn != false) {
                    additional = ' style="padding-right: 36px;"'
                }
                temp += '<div class="yiqin-modal-content"' + additional + '>' + options.content + '</div>';
                if (options.closeBtn != false) {
                    temp += '<a class="yiqin-modal-close"></a>';
                }
                temp += '</div>';
                break;
            case 'alert':
                temp += '<div class="yiqin-modal yiqin-modal-alert active' + (options.skin ? ' ' + options.skin : '') + '" id="' + id + '">';
                temp += '<div class="yiqin-modal-content">' + options.content + '</div>';
                temp += '<div class="yiqin-modal-buttons">';
                temp += '<a class="yiqin-button primary">confirm</a>';
                temp += '</div>';
                temp += '</div>';
                break;
            case 'modal':
                temp += '<div class="yiqin-modal yiqin-modal-box active' + (options.skin ? ' ' + options.skin : '') + (options.animation ? ' ' + options.animation : '') + '" id="' + id + '">';
                temp += '<div class="yiqin-modal-content">' + options.content + '</div>';
                if (options.closeBtn != false) {
                    temp += '<a class="yiqin-modal-close"></a>';
                }
                temp += '<div class="yiqin-modal-buttons">';
                temp += '<a class="yiqin-button primary">confirm</a>';
                temp += '</div>';
                temp += '</div>';
                break;
            case 'load':
                temp += '<div class="yiqin-modal active loading-item' + (options.skin ? ' ' + options.skin : '') + ' ' + options.msgStatus + (options.animation ? ' ' + options.animation : '') + '" id="' + id + '">';
                temp += '<div class="yiqin-modal-content">' + icons(options.icon) + '</div>';
                temp += '</div>';
                break;
        }
        var d = document.getElementsByTagName('body')[0];
        var _d = document.createElement("div");
        var _id = "yiqin-modal-box-" + document.querySelectorAll('.yiqin-modal').length;
        _d.id = _id;
        _d.className = 'yiqin' + ' ' + options.type;
        _d.innerHTML = temp;
        options.onShow && options.onShow(this, _d, options);
        d.appendChild(_d);
        setPosition(_d, options);
        if (options.closeBtn != false) {
            registerCloseFunction(_d.querySelector('.yiqin-modal-close'), options);
        }
        if (options.type == 'alert' || options.type == 'modal') {
            registerCloseFunction(_d.querySelector('.yiqin-button'), options, options.type == 'modal' ? _id : false);
        }
        if (options.autoClose != false) {
            autoCloseTimer = null;
            var timeout;
            if (options.type == 'msg') {
                timeout = 3000;
            }
            if (typeof options.autoClose == 'number') {
                timeout = options.autoClose;
            }
            if (options.type == 'alert' || options.type == 'modal') {
            } else {
                autoCloseTimer = setTimeout(function () {
                    close(_d, options);
                }, timeout);
            }
        }
        options.callback && options.callback(this, _d, options);
        return [_d, options];
    };
    var close = function (node, options) {
        options.onClose && options.onClose(this, node, options);
        node.remove();
    };
    var registerCloseFunction = function (item, options, id) {
        item.addEventListener('click', function (e) {
            var target = e.target;
            if (options.type == 'alert' || options.type == 'modal') {
                if (typeof id != 'undefined' && id != false) {
                    close(document.getElementById(id), options);
                } else {
                    close(target.parentNode.parentNode, options);
                }
            } else {
                close(target.parentNode, options);
            }
        });
    };
    var setPosition = function (item, options) {
        item = item.querySelector('.yiqin-modal');
        var top = 22, left;
        if (options.position == 'lt') {
            left = 22;
        }
        if (options.position == 'ct') {
            left = document.body.clientWidth / 2 - item.clientWidth / 2;
        }
        if (options.position == 'rt') {
            left = document.body.clientWidth - item.clientWidth - 22;
        }
        if (options.position == 'center') {
            top = window.innerHeight / 2 - item.clientHeight / 2;
            left = document.body.clientWidth / 2 - item.clientWidth / 2;
        }
        if (options.position == 'lb') {
            top = window.innerHeight - item.clientHeight - 22;
            left = 22;
        }
        if (options.position == 'cb') {
            top = window.innerHeight - item.clientHeight - 22;
            left = document.body.clientWidth / 2 - item.clientWidth / 2;
        }
        if (options.position == 'rb') {
            top = window.innerHeight - item.clientHeight - 22;
            left = document.body.clientWidth - item.clientWidth - 22;
        }
        item.style.top = top + 'px';
        item.style.left = left + 'px';
    };
    var icons = function (name) {
        var iconData = {
            'loading1': `<svg version="1.1" id="loader-1" xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 40 40"
                enable-background="new 0 0 40 40" xml:space="preserve">
                <path opacity="0.2" fill="#000"
                    d="M20.201,5.169c-8.254,0-14.946,6.692-14.946,14.946c0,8.255,6.692,14.946,14.946,14.946
          s14.946-6.691,14.946-14.946C35.146,11.861,28.455,5.169,20.201,5.169z M20.201,31.749c-6.425,0-11.634-5.208-11.634-11.634
          c0-6.425,5.209-11.634,11.634-11.634c6.425,0,11.633,5.209,11.633,11.634C31.834,26.541,26.626,31.749,20.201,31.749z"></path>
                <path fill="#fff" d="M26.013,10.047l1.654-2.866c-2.198-1.272-4.743-2.012-7.466-2.012h0v3.312h0
          C22.32,8.481,24.301,9.057,26.013,10.047z">
                    <animateTransform attributeType="xml" attributeName="transform" type="rotate" from="0 20 20"
                        to="360 20 20" dur="0.5s" repeatCount="indefinite"></animateTransform>
                </path>
            </svg>`,
            'loading2': `<svg version="1.1" id="loader-1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="40px" viewBox="0 0 50 50" style="enable-background:new 0 0 50 50;" xml:space="preserve">
            <path fill="#fff" d="M43.935,25.145c0-10.318-8.364-18.683-18.683-18.683c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615c8.072,0,14.615,6.543,14.615,14.615H43.935z">
              <animateTransform attributeType="xml" attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.6s" repeatCount="indefinite"></animateTransform>
              </path>
            </svg>`
        };
        return iconData[name];
    }
    window.yiqin = yiqin;
})(this);