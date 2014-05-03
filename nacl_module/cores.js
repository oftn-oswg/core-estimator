/*
 * Core Estimator
 * CPU core estimation using PNaCl
 * 2014-05-04
 * 
 * Copyright ΩF:∅ Working Group contributors
 * License: X11/MIT
 *   See LICENSE.md
 */
"use strict";
(function() {
    /**
     * A function to see if PNaCl is supported by the browser
     */
    function support_pnacl() {
        return navigator.mimeTypes['application/x-pnacl'] !== undefined;
    }
    /**
     * find_cores()
     * @todo : expose this to the rest estimator
     * given an element and a callback, use the NaCl plugin to find the number of cores
     * 
     * @param  {HTMLElement} parentElem The element in the html document to put the NaCl embed.
     *                                  shown upon error
     * @param  {Function}    cb         The callback to call with arguments [error, cores]
     */
    function find_cores(parentElem, cb) {
        var listenerDiv = make_listener_elem(function() {
            nacl_module.postMessage(0);
        }, function(message) {
              cb(null, message.data);
        }, cb, cb);

        var nacl_module = make_embed(listenerDiv);
        parentElem.appendChild(listenerDiv);
    }
    window.find_cores = find_cores;
    /**
     * make_listener_elem
     * make a listener element given some callback
     * @param  {Function} load    The function to call when the NaCl plugin loads
     * @param  {Function} message Called when a message from the plugin is posted
     * @param  {Function} error   Called upon error
     * @param  {Function} crash   Called when the plugin exits
     * @return {HTMLElement}      listener div
     */
    function make_listener_elem(load, message, error, crash) {
        var listenerDiv = document.createElement('div');
        listenerDiv.addEventListener('load', load, true);
        listenerDiv.addEventListener('message', message, true);
        listenerDiv.addEventListener('error', error, true);
        listenerDiv.addEventListener('crash', crash, true);
        return listenerDiv;
    }
    /**
     * make_embed()
     *
     * Given a listener element,
     * make an embed tag pointing to the NaCl manifest
     * and append it to the listener
     *
     **/
    function make_embed(listener) {
        var embed = document.createElement('embed');
        embed.setAttribute('path', 'pnacl/Release');
        embed.setAttribute('src', 'pnacl/Release/cores.nmf');
        embed.setAttribute('type', 'application/x-pnacl');
        listener.appendChild(embed);
        return embed;
    }
})();
