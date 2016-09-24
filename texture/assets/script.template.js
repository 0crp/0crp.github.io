// ==UserScript==
// @name           Tagpro Custom Texture
// @include        http://tagpro-*.koalabeast.com*
// @include        http://tangent.jukejuice.com*
// @include        http://*.newcompte.fr*
// @version        1.0
// @run-at         document-end
// ==/UserScript==

if (unsafeWindow.tagpro && unsafeWindow.tagpro.loadAssets) {

    unsafeWindow.tagpro.loadAssets({
        tiles: ':tiles:',
        speedpad: ':speedpad:',
        speedpadRed: ':speedpadred:',
        speedpadBlue: ':speedpadblue:',
        portal: ':portal:',
        splats: ':splats:'
    });

}
