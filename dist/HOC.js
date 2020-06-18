var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import React, { useRef } from 'react';
import Downloader from './Downloader';
export default function withDownloader(params) {
    return function (WrappedComponent) { return function (props) {
        var downloader = useRef(new Downloader(params)).current;
        var transProps = __assign(__assign({}, props), { downloader: downloader });
        return React.createElement(WrappedComponent, __assign({}, transProps));
    }; };
}
