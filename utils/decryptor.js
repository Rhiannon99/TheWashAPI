const _0x98d6 = ["+10", "+8", "[", "charCodeAt", "fromCharCode", "replace", "", "length"];
function r(a, b) {
    return ++b ? String[_0x98d6[4]]((a < _0x98d6[2] ? 91 : 123) > (a = a[_0x98d6[3]]() + 13) ? a : a - 26) : a[_0x98d6[5]](/[a-zA-Z]/g, r)
}
module.exports = {
    re: (a, b) => {
        let c = _0x98d6[6];
        for (let d = 0; d < a[_0x98d6[7]]; d++) {
            let e = a[_0x98d6[3]](d);
            if (e >= 97 && e <= 122) {
                c += String[_0x98d6[4]]((e - 97 - b + 26) % 26 + 97)
            } else {
                if (e >= 65 && e <= 90) {
                    c += String[_0x98d6[4]]((e - 65 - b + 26) % 26 + 65)
                } else {
                    c += String[_0x98d6[4]](e)
                }
            }
        };
        return c
    },
    t: _0x98d6[0],
    vsd: {
        _keyStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
        encode: function(_0x473ex2) {
            let _0x473ex3 = '';
            let _0x473ex4, _0x473ex5, _0x473ex6, _0x473ex7, _0x473ex8, _0x473ex9, _0x473exa;
            let _0x473exb = 0;
            _0x473ex2 = this._utf8_encode(_0x473ex2);
            while (_0x473exb < _0x473ex2['length']) {
                _0x473ex4 = _0x473ex2['charCodeAt'](_0x473exb++);
                _0x473ex5 = _0x473ex2['charCodeAt'](_0x473exb++);
                _0x473ex6 = _0x473ex2['charCodeAt'](_0x473exb++);
                _0x473ex7 = _0x473ex4 >> 2;
                _0x473ex8 = ((_0x473ex4 & 3) << 4) | (_0x473ex5 >> 4);
                _0x473ex9 = ((_0x473ex5 & 15) << 2) | (_0x473ex6 >> 6);
                _0x473exa = _0x473ex6 & 63;
                if (isNaN(_0x473ex5)) {
                    _0x473ex9 = _0x473exa = 64
                } else {
                    if (isNaN(_0x473ex6)) {
                        _0x473exa = 64
                    }
                };
                _0x473ex3 = _0x473ex3 + this['_keyStr']['charAt'](_0x473ex7) + this['_keyStr']['charAt'](_0x473ex8) + this['_keyStr']['charAt'](_0x473ex9) + this['_keyStr']['charAt'](_0x473exa)
            };
            return _0x473ex3
        },
        d: function(_0x473ex2) {
            let _0x473ex3 = '';
            let _0x473ex4, _0x473ex5, _0x473ex6;
            let _0x473ex7, _0x473ex8, _0x473ex9, _0x473exa;
            let _0x473exb = 0;
            _0x473ex2 = _0x473ex2['replace'](/[^A-Za-z0-9\+\/\=]/g, '');
            while (_0x473exb < _0x473ex2['length']) {
                _0x473ex7 = this['_keyStr']['indexOf'](_0x473ex2['charAt'](_0x473exb++));
                _0x473ex8 = this['_keyStr']['indexOf'](_0x473ex2['charAt'](_0x473exb++));
                _0x473ex9 = this['_keyStr']['indexOf'](_0x473ex2['charAt'](_0x473exb++));
                _0x473exa = this['_keyStr']['indexOf'](_0x473ex2['charAt'](_0x473exb++));
                _0x473ex4 = (_0x473ex7 << 2) | (_0x473ex8 >> 4);
                _0x473ex5 = ((_0x473ex8 & 15) << 4) | (_0x473ex9 >> 2);
                _0x473ex6 = ((_0x473ex9 & 3) << 6) | _0x473exa;
                _0x473ex3 = _0x473ex3 + String['fromCharCode'](_0x473ex4);
                if (_0x473ex9 != 64) {
                    _0x473ex3 = _0x473ex3 + String['fromCharCode'](_0x473ex5)
                };
                if (_0x473exa != 64) {
                    _0x473ex3 = _0x473ex3 + String['fromCharCode'](_0x473ex6)
                }
            };
            _0x473ex3 = this._utf8_decode(_0x473ex3);
            return _0x473ex3
        },
        _utf8_encode: function(_0x473exc) {
            _0x473exc = _0x473exc['replace'](/\r\n/g, '\x0A');
            let _0x473exd = '';
            for (let _0x473exe = 0; _0x473exe < _0x473exc['length']; _0x473exe++) {
                let _0x473exf = _0x473exc['charCodeAt'](_0x473exe);
                if (_0x473exf < 128) {
                    _0x473exd += String['fromCharCode'](_0x473exf)
                } else {
                    if ((_0x473exf > 127) && (_0x473exf < 2048)) {
                        _0x473exd += String['fromCharCode']((_0x473exf >> 6) | 192);
                        _0x473exd += String['fromCharCode']((_0x473exf & 63) | 128)
                    } else {
                        _0x473exd += String['fromCharCode']((_0x473exf >> 12) | 224);
                        _0x473exd += String['fromCharCode'](((_0x473exf >> 6) & 63) | 128);
                        _0x473exd += String['fromCharCode']((_0x473exf & 63) | 128)
                    }
                }
            };
            return _0x473exd
        },
        _utf8_decode: function(_0x473exd) {
            let _0x473exc = '';
            let _0x473exb = 0;
            let _0x473exf = c1 = c2 = 0;
            while (_0x473exb < _0x473exd['length']) {
                _0x473exf = _0x473exd['charCodeAt'](_0x473exb);
                if (_0x473exf < 128) {
                    _0x473exc += String['fromCharCode'](_0x473exf);
                    _0x473exb++
                } else {
                    if ((_0x473exf > 191) && (_0x473exf < 224)) {
                        c2 = _0x473exd['charCodeAt'](_0x473exb + 1);
                        _0x473exc += String['fromCharCode'](((_0x473exf & 31) << 6) | (c2 & 63));
                        _0x473exb += 2
                    } else {
                        c2 = _0x473exd['charCodeAt'](_0x473exb + 1);
                        c3 = _0x473exd['charCodeAt'](_0x473exb + 2);
                        _0x473exc += String['fromCharCode'](((_0x473exf & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                        _0x473exb += 3
                    }
                }
            };
            return _0x473exc
        }
    },
    t : _0x98d6[0],
    e : _0x98d6[1],
}