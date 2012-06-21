// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Bootstrap for the Google JS Library (Closure).
 *
 * In uncompiled mode base.js will write out Closure's deps file, unless the
 * global <code>CLOSURE_NO_DEPS</code> is set to true.  This allows projects to
 * include their own deps file(s) from different locations.
 *
 */


/**
 * @define {boolean} Overridden to true by the compiler when --closure_pass
 *     or --mark_as_compiled is specified.
 */
var COMPILED = false;


/**
 * Base namespace for the Closure library.  Checks to see goog is
 * already defined in the current scope before assigning to prevent
 * clobbering if base.js is loaded more than once.
 *
 * @const
 */
var goog = goog || {}; // Identifies this file as the Closure base.


/**
 * Reference to the global context.  In most cases this will be 'window'.
 */
goog.global = this;


/**
 * @define {boolean} DEBUG is provided as a convenience so that debugging code
 * that should not be included in a production js_binary can be easily stripped
 * by specifying --define goog.DEBUG=false to the JSCompiler. For example, most
 * toString() methods should be declared inside an "if (goog.DEBUG)" conditional
 * because they are generally used for debugging purposes and it is difficult
 * for the JSCompiler to statically determine whether they are used.
 */
goog.DEBUG = true;


/**
 * @define {string} LOCALE defines the locale being used for compilation. It is
 * used to select locale specific data to be compiled in js binary. BUILD rule
 * can specify this value by "--define goog.LOCALE=<locale_name>" as JSCompiler
 * option.
 *
 * Take into account that the locale code format is important. You should use
 * the canonical Unicode format with hyphen as a delimiter. Language must be
 * lowercase, Language Script - Capitalized, Region - UPPERCASE.
 * There are few examples: pt-BR, en, en-US, sr-Latin-BO, zh-Hans-CN.
 *
 * See more info about locale codes here:
 * http://www.unicode.org/reports/tr35/#Unicode_Language_and_Locale_Identifiers
 *
 * For language codes you should use values defined by ISO 693-1. See it here
 * http://www.w3.org/WAI/ER/IG/ert/iso639.htm. There is only one exception from
 * this rule: the Hebrew language. For legacy reasons the old code (iw) should
 * be used instead of the new code (he), see http://wiki/Main/IIISynonyms.
 */
goog.LOCALE = 'en';  // default to en


/**
 * Creates object stubs for a namespace.  The presence of one or more
 * goog.provide() calls indicate that the file defines the given
 * objects/namespaces.  Build tools also scan for provide/require statements
 * to discern dependencies, build dependency files (see deps.js), etc.
 * @see goog.require
 * @param {string} name Namespace provided by this file in the form
 *     "goog.package.part".
 */
goog.provide = function(name) {
  if (!COMPILED) {
    // Ensure that the same namespace isn't provided twice. This is intended
    // to teach new developers that 'goog.provide' is effectively a variable
    // declaration. And when JSCompiler transforms goog.provide into a real
    // variable declaration, the compiled JS should work the same as the raw
    // JS--even when the raw JS uses goog.provide incorrectly.
    if (goog.isProvided_(name)) {
      throw Error('Namespace "' + name + '" already declared.');
    }
    delete goog.implicitNamespaces_[name];

    var namespace = name;
    while ((namespace = namespace.substring(0, namespace.lastIndexOf('.')))) {
      if (goog.getObjectByName(namespace)) {
        break;
      }
      goog.implicitNamespaces_[namespace] = true;
    }
  }

  goog.exportPath_(name);
};


/**
 * Marks that the current file should only be used for testing, and never for
 * live code in production.
 * @param {string=} opt_message Optional message to add to the error that's
 *     raised when used in production code.
 */
goog.setTestOnly = function(opt_message) {
  if (COMPILED && !goog.DEBUG) {
    opt_message = opt_message || '';
    throw Error('Importing test-only code into non-debug environment' +
                opt_message ? ': ' + opt_message : '.');
  }
};


if (!COMPILED) {

  /**
   * Check if the given name has been goog.provided. This will return false for
   * names that are available only as implicit namespaces.
   * @param {string} name name of the object to look for.
   * @return {boolean} Whether the name has been provided.
   * @private
   */
  goog.isProvided_ = function(name) {
    return !goog.implicitNamespaces_[name] && !!goog.getObjectByName(name);
  };

  /**
   * Namespaces implicitly defined by goog.provide. For example,
   * goog.provide('goog.events.Event') implicitly declares
   * that 'goog' and 'goog.events' must be namespaces.
   *
   * @type {Object}
   * @private
   */
  goog.implicitNamespaces_ = {};
}


/**
 * Builds an object structure for the provided namespace path,
 * ensuring that names that already exist are not overwritten. For
 * example:
 * "a.b.c" -> a = {};a.b={};a.b.c={};
 * Used by goog.provide and goog.exportSymbol.
 * @param {string} name name of the object that this file defines.
 * @param {*=} opt_object the object to expose at the end of the path.
 * @param {Object=} opt_objectToExportTo The object to add the path to; default
 *     is |goog.global|.
 * @private
 */
goog.exportPath_ = function(name, opt_object, opt_objectToExportTo) {
  var parts = name.split('.');
  var cur = opt_objectToExportTo || goog.global;

  // Internet Explorer exhibits strange behavior when throwing errors from
  // methods externed in this manner.  See the testExportSymbolExceptions in
  // base_test.html for an example.
  if (!(parts[0] in cur) && cur.execScript) {
    cur.execScript('var ' + parts[0]);
  }

  // Certain browsers cannot parse code in the form for((a in b); c;);
  // This pattern is produced by the JSCompiler when it collapses the
  // statement above into the conditional loop below. To prevent this from
  // happening, use a for-loop and reserve the init logic as below.

  // Parentheses added to eliminate strict JS warning in Firefox.
  for (var part; parts.length && (part = parts.shift());) {
    if (!parts.length && goog.isDef(opt_object)) {
      // last part and we have an object; use it
      cur[part] = opt_object;
    } else if (cur[part]) {
      cur = cur[part];
    } else {
      cur = cur[part] = {};
    }
  }
};


/**
 * Returns an object based on its fully qualified external name.  If you are
 * using a compilation pass that renames property names beware that using this
 * function will not find renamed properties.
 *
 * @param {string} name The fully qualified name.
 * @param {Object=} opt_obj The object within which to look; default is
 *     |goog.global|.
 * @return {?} The value (object or primitive) or, if not found, null.
 */
goog.getObjectByName = function(name, opt_obj) {
  var parts = name.split('.');
  var cur = opt_obj || goog.global;
  for (var part; part = parts.shift(); ) {
    if (goog.isDefAndNotNull(cur[part])) {
      cur = cur[part];
    } else {
      return null;
    }
  }
  return cur;
};


/**
 * Globalizes a whole namespace, such as goog or goog.lang.
 *
 * @param {Object} obj The namespace to globalize.
 * @param {Object=} opt_global The object to add the properties to.
 * @deprecated Properties may be explicitly exported to the global scope, but
 *     this should no longer be done in bulk.
 */
goog.globalize = function(obj, opt_global) {
  var global = opt_global || goog.global;
  for (var x in obj) {
    global[x] = obj[x];
  }
};


/**
 * Adds a dependency from a file to the files it requires.
 * @param {string} relPath The path to the js file.
 * @param {Array} provides An array of strings with the names of the objects
 *                         this file provides.
 * @param {Array} requires An array of strings with the names of the objects
 *                         this file requires.
 */
goog.addDependency = function(relPath, provides, requires) {
  if (!COMPILED) {
    var provide, require;
    var path = relPath.replace(/\\/g, '/');
    var deps = goog.dependencies_;
    for (var i = 0; provide = provides[i]; i++) {
      deps.nameToPath[provide] = path;
      if (!(path in deps.pathToNames)) {
        deps.pathToNames[path] = {};
      }
      deps.pathToNames[path][provide] = true;
    }
    for (var j = 0; require = requires[j]; j++) {
      if (!(path in deps.requires)) {
        deps.requires[path] = {};
      }
      deps.requires[path][require] = true;
    }
  }
};




// NOTE(nnaze): The debug DOM loader was included in base.js as an orignal
// way to do "debug-mode" development.  The dependency system can sometimes
// be confusing, as can the debug DOM loader's asyncronous nature.
//
// With the DOM loader, a call to goog.require() is not blocking -- the
// script will not load until some point after the current script.  If a
// namespace is needed at runtime, it needs to be defined in a previous
// script, or loaded via require() with its registered dependencies.
// User-defined namespaces may need their own deps file.  See http://go/js_deps,
// http://go/genjsdeps, or, externally, DepsWriter.
// http://code.google.com/closure/library/docs/depswriter.html
//
// Because of legacy clients, the DOM loader can't be easily removed from
// base.js.  Work is being done to make it disableable or replaceable for
// different environments (DOM-less JavaScript interpreters like Rhino or V8,
// for example). See bootstrap/ for more information.


/**
 * @define {boolean} Whether to enable the debug loader.
 *
 * If enabled, a call to goog.require() will attempt to load the namespace by
 * appending a script tag to the DOM (if the namespace has been registered).
 *
 * If disabled, goog.require() will simply assert that the namespace has been
 * provided (and depend on the fact that some outside tool correctly ordered
 * the script).
 */
goog.ENABLE_DEBUG_LOADER = true;


/**
 * Implements a system for the dynamic resolution of dependencies
 * that works in parallel with the BUILD system. Note that all calls
 * to goog.require will be stripped by the JSCompiler when the
 * --closure_pass option is used.
 * @see goog.provide
 * @param {string} name Namespace to include (as was given in goog.provide())
 *     in the form "goog.package.part".
 */
goog.require = function(name) {

  // if the object already exists we do not need do do anything
  // TODO(arv): If we start to support require based on file name this has
  //            to change
  // TODO(arv): If we allow goog.foo.* this has to change
  // TODO(arv): If we implement dynamic load after page load we should probably
  //            not remove this code for the compiled output
  if (!COMPILED) {
    if (goog.isProvided_(name)) {
      return;
    }

    if (goog.ENABLE_DEBUG_LOADER) {
      var path = goog.getPathFromDeps_(name);
      if (path) {
        goog.included_[path] = true;
        goog.writeScripts_();
        return;
      }
    }

    var errorMessage = 'goog.require could not find: ' + name;
    if (goog.global.console) {
      goog.global.console['error'](errorMessage);
    }


      throw Error(errorMessage);

  }
};


/**
 * Path for included scripts
 * @type {string}
 */
goog.basePath = '';


/**
 * A hook for overriding the base path.
 * @type {string|undefined}
 */
goog.global.CLOSURE_BASE_PATH;


/**
 * Whether to write out Closure's deps file. By default,
 * the deps are written.
 * @type {boolean|undefined}
 */
goog.global.CLOSURE_NO_DEPS;


/**
 * A function to import a single script. This is meant to be overridden when
 * Closure is being run in non-HTML contexts, such as web workers. It's defined
 * in the global scope so that it can be set before base.js is loaded, which
 * allows deps.js to be imported properly.
 *
 * The function is passed the script source, which is a relative URI. It should
 * return true if the script was imported, false otherwise.
 */
goog.global.CLOSURE_IMPORT_SCRIPT;


/**
 * Null function used for default values of callbacks, etc.
 * @return {void} Nothing.
 */
goog.nullFunction = function() {};


/**
 * The identity function. Returns its first argument.
 *
 * @param {*=} opt_returnValue The single value that will be returned.
 * @param {...*} var_args Optional trailing arguments. These are ignored.
 * @return {?} The first argument. We can't know the type -- just pass it along
 *      without type.
 * @deprecated Use goog.functions.identity instead.
 */
goog.identityFunction = function(opt_returnValue, var_args) {
  return opt_returnValue;
};


/**
 * When defining a class Foo with an abstract method bar(), you can do:
 *
 * Foo.prototype.bar = goog.abstractMethod
 *
 * Now if a subclass of Foo fails to override bar(), an error
 * will be thrown when bar() is invoked.
 *
 * Note: This does not take the name of the function to override as
 * an argument because that would make it more difficult to obfuscate
 * our JavaScript code.
 *
 * @type {!Function}
 * @throws {Error} when invoked to indicate the method should be
 *   overridden.
 */
goog.abstractMethod = function() {
  throw Error('unimplemented abstract method');
};


/**
 * Adds a {@code getInstance} static method that always return the same instance
 * object.
 * @param {!Function} ctor The constructor for the class to add the static
 *     method to.
 */
goog.addSingletonGetter = function(ctor) {
  ctor.getInstance = function() {
    if (ctor.instance_) {
      return ctor.instance_;
    }
    if (goog.DEBUG) {
      // NOTE: JSCompiler can't optimize away Array#push.
      goog.instantiatedSingletons_[goog.instantiatedSingletons_.length] = ctor;
    }
    return ctor.instance_ = new ctor;
  };
};


/**
 * All singleton classes that have been instantiated, for testing. Don't read
 * it directly, use the {@code goog.testing.singleton} module. The compiler
 * removes this variable if unused.
 * @type {!Array.<!Function>}
 * @private
 */
goog.instantiatedSingletons_ = [];


if (!COMPILED && goog.ENABLE_DEBUG_LOADER) {
  /**
   * Object used to keep track of urls that have already been added. This
   * record allows the prevention of circular dependencies.
   * @type {Object}
   * @private
   */
  goog.included_ = {};


  /**
   * This object is used to keep track of dependencies and other data that is
   * used for loading scripts
   * @private
   * @type {Object}
   */
  goog.dependencies_ = {
    pathToNames: {}, // 1 to many
    nameToPath: {}, // 1 to 1
    requires: {}, // 1 to many
    // used when resolving dependencies to prevent us from
    // visiting the file twice
    visited: {},
    written: {} // used to keep track of script files we have written
  };


  /**
   * Tries to detect whether is in the context of an HTML document.
   * @return {boolean} True if it looks like HTML document.
   * @private
   */
  goog.inHtmlDocument_ = function() {
    var doc = goog.global.document;
    return typeof doc != 'undefined' &&
           'write' in doc;  // XULDocument misses write.
  };


  /**
   * Tries to detect the base path of the base.js script that bootstraps Closure
   * @private
   */
  goog.findBasePath_ = function() {
    if (goog.global.CLOSURE_BASE_PATH) {
      goog.basePath = goog.global.CLOSURE_BASE_PATH;
      return;
    } else if (!goog.inHtmlDocument_()) {
      return;
    }
    var doc = goog.global.document;
    var scripts = doc.getElementsByTagName('script');
    // Search backwards since the current script is in almost all cases the one
    // that has base.js.
    for (var i = scripts.length - 1; i >= 0; --i) {
      var src = scripts[i].src;
      var qmark = src.lastIndexOf('?');
      var l = qmark == -1 ? src.length : qmark;
      if (src.substr(l - 7, 7) == 'base.js') {
        goog.basePath = src.substr(0, l - 7);
        return;
      }
    }
  };


  /**
   * Imports a script if, and only if, that script hasn't already been imported.
   * (Must be called at execution time)
   * @param {string} src Script source.
   * @private
   */
  goog.importScript_ = function(src) {
    var importScript = goog.global.CLOSURE_IMPORT_SCRIPT ||
        goog.writeScriptTag_;
    if (!goog.dependencies_.written[src] && importScript(src)) {
      goog.dependencies_.written[src] = true;
    }
  };


  /**
   * The default implementation of the import function. Writes a script tag to
   * import the script.
   *
   * @param {string} src The script source.
   * @return {boolean} True if the script was imported, false otherwise.
   * @private
   */
  goog.writeScriptTag_ = function(src) {
    if (goog.inHtmlDocument_()) {
      var doc = goog.global.document;
      doc.write(
          '<script type="text/javascript" src="' + src + '"></' + 'script>');
      return true;
    } else {
      return false;
    }
  };


  /**
   * Resolves dependencies based on the dependencies added using addDependency
   * and calls importScript_ in the correct order.
   * @private
   */
  goog.writeScripts_ = function() {
    // the scripts we need to write this time
    var scripts = [];
    var seenScript = {};
    var deps = goog.dependencies_;

    function visitNode(path) {
      if (path in deps.written) {
        return;
      }

      // we have already visited this one. We can get here if we have cyclic
      // dependencies
      if (path in deps.visited) {
        if (!(path in seenScript)) {
          seenScript[path] = true;
          scripts.push(path);
        }
        return;
      }

      deps.visited[path] = true;

      if (path in deps.requires) {
        for (var requireName in deps.requires[path]) {
          // If the required name is defined, we assume that it was already
          // bootstrapped by other means.
          if (!goog.isProvided_(requireName)) {
            if (requireName in deps.nameToPath) {
              visitNode(deps.nameToPath[requireName]);
            } else {
              throw Error('Undefined nameToPath for ' + requireName);
            }
          }
        }
      }

      if (!(path in seenScript)) {
        seenScript[path] = true;
        scripts.push(path);
      }
    }

    for (var path in goog.included_) {
      if (!deps.written[path]) {
        visitNode(path);
      }
    }

    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i]) {
        goog.importScript_(goog.basePath + scripts[i]);
      } else {
        throw Error('Undefined script input');
      }
    }
  };


  /**
   * Looks at the dependency rules and tries to determine the script file that
   * fulfills a particular rule.
   * @param {string} rule In the form goog.namespace.Class or project.script.
   * @return {?string} Url corresponding to the rule, or null.
   * @private
   */
  goog.getPathFromDeps_ = function(rule) {
    if (rule in goog.dependencies_.nameToPath) {
      return goog.dependencies_.nameToPath[rule];
    } else {
      return null;
    }
  };

  goog.findBasePath_();

  // Allow projects to manage the deps files themselves.
  if (!goog.global.CLOSURE_NO_DEPS) {
    goog.importScript_(goog.basePath + 'deps.js');
  }
}



//==============================================================================
// Language Enhancements
//==============================================================================


/**
 * This is a "fixed" version of the typeof operator.  It differs from the typeof
 * operator in such a way that null returns 'null' and arrays return 'array'.
 * @param {*} value The value to get the type of.
 * @return {string} The name of the type.
 */
goog.typeOf = function(value) {
  var s = typeof value;
  if (s == 'object') {
    if (value) {
      // Check these first, so we can avoid calling Object.prototype.toString if
      // possible.
      //
      // IE improperly marshals tyepof across execution contexts, but a
      // cross-context object will still return false for "instanceof Object".
      if (value instanceof Array) {
        return 'array';
      } else if (value instanceof Object) {
        return s;
      }

      // HACK: In order to use an Object prototype method on the arbitrary
      //   value, the compiler requires the value be cast to type Object,
      //   even though the ECMA spec explicitly allows it.
      var className = Object.prototype.toString.call(
          /** @type {Object} */ (value));
      // In Firefox 3.6, attempting to access iframe window objects' length
      // property throws an NS_ERROR_FAILURE, so we need to special-case it
      // here.
      if (className == '[object Window]') {
        return 'object';
      }

      // We cannot always use constructor == Array or instanceof Array because
      // different frames have different Array objects. In IE6, if the iframe
      // where the array was created is destroyed, the array loses its
      // prototype. Then dereferencing val.splice here throws an exception, so
      // we can't use goog.isFunction. Calling typeof directly returns 'unknown'
      // so that will work. In this case, this function will return false and
      // most array functions will still work because the array is still
      // array-like (supports length and []) even though it has lost its
      // prototype.
      // Mark Miller noticed that Object.prototype.toString
      // allows access to the unforgeable [[Class]] property.
      //  15.2.4.2 Object.prototype.toString ( )
      //  When the toString method is called, the following steps are taken:
      //      1. Get the [[Class]] property of this object.
      //      2. Compute a string value by concatenating the three strings
      //         "[object ", Result(1), and "]".
      //      3. Return Result(2).
      // and this behavior survives the destruction of the execution context.
      if ((className == '[object Array]' ||
           // In IE all non value types are wrapped as objects across window
           // boundaries (not iframe though) so we have to do object detection
           // for this edge case
           typeof value.length == 'number' &&
           typeof value.splice != 'undefined' &&
           typeof value.propertyIsEnumerable != 'undefined' &&
           !value.propertyIsEnumerable('splice')

          )) {
        return 'array';
      }
      // HACK: There is still an array case that fails.
      //     function ArrayImpostor() {}
      //     ArrayImpostor.prototype = [];
      //     var impostor = new ArrayImpostor;
      // this can be fixed by getting rid of the fast path
      // (value instanceof Array) and solely relying on
      // (value && Object.prototype.toString.vall(value) === '[object Array]')
      // but that would require many more function calls and is not warranted
      // unless closure code is receiving objects from untrusted sources.

      // IE in cross-window calls does not correctly marshal the function type
      // (it appears just as an object) so we cannot use just typeof val ==
      // 'function'. However, if the object has a call property, it is a
      // function.
      if ((className == '[object Function]' ||
          typeof value.call != 'undefined' &&
          typeof value.propertyIsEnumerable != 'undefined' &&
          !value.propertyIsEnumerable('call'))) {
        return 'function';
      }


    } else {
      return 'null';
    }

  } else if (s == 'function' && typeof value.call == 'undefined') {
    // In Safari typeof nodeList returns 'function', and on Firefox
    // typeof behaves similarly for HTML{Applet,Embed,Object}Elements
    // and RegExps.  We would like to return object for those and we can
    // detect an invalid function by making sure that the function
    // object has a call method.
    return 'object';
  }
  return s;
};


/**
 * Returns true if the specified value is not |undefined|.
 * WARNING: Do not use this to test if an object has a property. Use the in
 * operator instead.  Additionally, this function assumes that the global
 * undefined variable has not been redefined.
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is defined.
 */
goog.isDef = function(val) {
  return val !== undefined;
};


/**
 * Returns true if the specified value is |null|
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is null.
 */
goog.isNull = function(val) {
  return val === null;
};


/**
 * Returns true if the specified value is defined and not null
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is defined and not null.
 */
goog.isDefAndNotNull = function(val) {
  // Note that undefined == null.
  return val != null;
};


/**
 * Returns true if the specified value is an array
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is an array.
 */
goog.isArray = function(val) {
  return goog.typeOf(val) == 'array';
};


/**
 * Returns true if the object looks like an array. To qualify as array like
 * the value needs to be either a NodeList or an object with a Number length
 * property.
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is an array.
 */
goog.isArrayLike = function(val) {
  var type = goog.typeOf(val);
  return type == 'array' || type == 'object' && typeof val.length == 'number';
};


/**
 * Returns true if the object looks like a Date. To qualify as Date-like
 * the value needs to be an object and have a getFullYear() function.
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is a like a Date.
 */
goog.isDateLike = function(val) {
  return goog.isObject(val) && typeof val.getFullYear == 'function';
};


/**
 * Returns true if the specified value is a string
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is a string.
 */
goog.isString = function(val) {
  return typeof val == 'string';
};


/**
 * Returns true if the specified value is a boolean
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is boolean.
 */
goog.isBoolean = function(val) {
  return typeof val == 'boolean';
};


/**
 * Returns true if the specified value is a number
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is a number.
 */
goog.isNumber = function(val) {
  return typeof val == 'number';
};


/**
 * Returns true if the specified value is a function
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is a function.
 */
goog.isFunction = function(val) {
  return goog.typeOf(val) == 'function';
};


/**
 * Returns true if the specified value is an object.  This includes arrays
 * and functions.
 * @param {*} val Variable to test.
 * @return {boolean} Whether variable is an object.
 */
goog.isObject = function(val) {
  var type = typeof val;
  return type == 'object' && val != null || type == 'function';
  // return Object(val) === val also works, but is slower, especially if val is
  // not an object.
};


/**
 * Gets a unique ID for an object. This mutates the object so that further
 * calls with the same object as a parameter returns the same value. The unique
 * ID is guaranteed to be unique across the current session amongst objects that
 * are passed into {@code getUid}. There is no guarantee that the ID is unique
 * or consistent across sessions. It is unsafe to generate unique ID for
 * function prototypes.
 *
 * @param {Object} obj The object to get the unique ID for.
 * @return {number} The unique ID for the object.
 */
goog.getUid = function(obj) {
  // TODO(arv): Make the type stricter, do not accept null.

  // In Opera window.hasOwnProperty exists but always returns false so we avoid
  // using it. As a consequence the unique ID generated for BaseClass.prototype
  // and SubClass.prototype will be the same.
  return obj[goog.UID_PROPERTY_] ||
      (obj[goog.UID_PROPERTY_] = ++goog.uidCounter_);
};


/**
 * Removes the unique ID from an object. This is useful if the object was
 * previously mutated using {@code goog.getUid} in which case the mutation is
 * undone.
 * @param {Object} obj The object to remove the unique ID field from.
 */
goog.removeUid = function(obj) {
  // TODO(arv): Make the type stricter, do not accept null.

  // DOM nodes in IE are not instance of Object and throws exception
  // for delete. Instead we try to use removeAttribute
  if ('removeAttribute' in obj) {
    obj.removeAttribute(goog.UID_PROPERTY_);
  }
  /** @preserveTry */
  try {
    delete obj[goog.UID_PROPERTY_];
  } catch (ex) {
  }
};


/**
 * Name for unique ID property. Initialized in a way to help avoid collisions
 * with other closure javascript on the same page.
 * @type {string}
 * @private
 */
goog.UID_PROPERTY_ = 'closure_uid_' +
    Math.floor(Math.random() * 2147483648).toString(36);


/**
 * Counter for UID.
 * @type {number}
 * @private
 */
goog.uidCounter_ = 0;


/**
 * Adds a hash code field to an object. The hash code is unique for the
 * given object.
 * @param {Object} obj The object to get the hash code for.
 * @return {number} The hash code for the object.
 * @deprecated Use goog.getUid instead.
 */
goog.getHashCode = goog.getUid;


/**
 * Removes the hash code field from an object.
 * @param {Object} obj The object to remove the field from.
 * @deprecated Use goog.removeUid instead.
 */
goog.removeHashCode = goog.removeUid;


/**
 * Clones a value. The input may be an Object, Array, or basic type. Objects and
 * arrays will be cloned recursively.
 *
 * WARNINGS:
 * <code>goog.cloneObject</code> does not detect reference loops. Objects that
 * refer to themselves will cause infinite recursion.
 *
 * <code>goog.cloneObject</code> is unaware of unique identifiers, and copies
 * UIDs created by <code>getUid</code> into cloned results.
 *
 * @param {*} obj The value to clone.
 * @return {*} A clone of the input value.
 * @deprecated goog.cloneObject is unsafe. Prefer the goog.object methods.
 */
goog.cloneObject = function(obj) {
  var type = goog.typeOf(obj);
  if (type == 'object' || type == 'array') {
    if (obj.clone) {
      return obj.clone();
    }
    var clone = type == 'array' ? [] : {};
    for (var key in obj) {
      clone[key] = goog.cloneObject(obj[key]);
    }
    return clone;
  }

  return obj;
};


/**
 * Forward declaration for the clone method. This is necessary until the
 * compiler can better support duck-typing constructs as used in
 * goog.cloneObject.
 *
 * TODO(brenneman): Remove once the JSCompiler can infer that the check for
 * proto.clone is safe in goog.cloneObject.
 *
 * @type {Function}
 */
Object.prototype.clone;


/**
 * A native implementation of goog.bind.
 * @param {Function} fn A function to partially apply.
 * @param {Object|undefined} selfObj Specifies the object which |this| should
 *     point to when the function is run.
 * @param {...*} var_args Additional arguments that are partially
 *     applied to the function.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 * @private
 * @suppress {deprecated} The compiler thinks that Function.prototype.bind
 *     is deprecated because some people have declared a pure-JS version.
 *     Only the pure-JS version is truly deprecated.
 */
goog.bindNative_ = function(fn, selfObj, var_args) {
  return /** @type {!Function} */ (fn.call.apply(fn.bind, arguments));
};


/**
 * A pure-JS implementation of goog.bind.
 * @param {Function} fn A function to partially apply.
 * @param {Object|undefined} selfObj Specifies the object which |this| should
 *     point to when the function is run.
 * @param {...*} var_args Additional arguments that are partially
 *     applied to the function.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 * @private
 */
goog.bindJs_ = function(fn, selfObj, var_args) {
  if (!fn) {
    throw new Error();
  }

  if (arguments.length > 2) {
    var boundArgs = Array.prototype.slice.call(arguments, 2);
    return function() {
      // Prepend the bound arguments to the current arguments.
      var newArgs = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(newArgs, boundArgs);
      return fn.apply(selfObj, newArgs);
    };

  } else {
    return function() {
      return fn.apply(selfObj, arguments);
    };
  }
};


/**
 * Partially applies this function to a particular 'this object' and zero or
 * more arguments. The result is a new function with some arguments of the first
 * function pre-filled and the value of |this| 'pre-specified'.<br><br>
 *
 * Remaining arguments specified at call-time are appended to the pre-
 * specified ones.<br><br>
 *
 * Also see: {@link #partial}.<br><br>
 *
 * Usage:
 * <pre>var barMethBound = bind(myFunction, myObj, 'arg1', 'arg2');
 * barMethBound('arg3', 'arg4');</pre>
 *
 * @param {Function} fn A function to partially apply.
 * @param {Object|undefined} selfObj Specifies the object which |this| should
 *     point to when the function is run.
 * @param {...*} var_args Additional arguments that are partially
 *     applied to the function.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 * @suppress {deprecated} See above.
 */
goog.bind = function(fn, selfObj, var_args) {
  // TODO(nicksantos): narrow the type signature.
  if (Function.prototype.bind &&
      // NOTE(nicksantos): Somebody pulled base.js into the default
      // Chrome extension environment. This means that for Chrome extensions,
      // they get the implementation of Function.prototype.bind that
      // calls goog.bind instead of the native one. Even worse, we don't want
      // to introduce a circular dependency between goog.bind and
      // Function.prototype.bind, so we have to hack this to make sure it
      // works correctly.
      Function.prototype.bind.toString().indexOf('native code') != -1) {
    goog.bind = goog.bindNative_;
  } else {
    goog.bind = goog.bindJs_;
  }
  return goog.bind.apply(null, arguments);
};


/**
 * Like bind(), except that a 'this object' is not required. Useful when the
 * target function is already bound.
 *
 * Usage:
 * var g = partial(f, arg1, arg2);
 * g(arg3, arg4);
 *
 * @param {Function} fn A function to partially apply.
 * @param {...*} var_args Additional arguments that are partially
 *     applied to fn.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 */
goog.partial = function(fn, var_args) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    // Prepend the bound arguments to the current arguments.
    var newArgs = Array.prototype.slice.call(arguments);
    newArgs.unshift.apply(newArgs, args);
    return fn.apply(this, newArgs);
  };
};


/**
 * Copies all the members of a source object to a target object. This method
 * does not work on all browsers for all objects that contain keys such as
 * toString or hasOwnProperty. Use goog.object.extend for this purpose.
 * @param {Object} target Target.
 * @param {Object} source Source.
 */
goog.mixin = function(target, source) {
  for (var x in source) {
    target[x] = source[x];
  }

  // For IE7 or lower, the for-in-loop does not contain any properties that are
  // not enumerable on the prototype object (for example, isPrototypeOf from
  // Object.prototype) but also it will not include 'replace' on objects that
  // extend String and change 'replace' (not that it is common for anyone to
  // extend anything except Object).
};


/**
 * @return {number} An integer value representing the number of milliseconds
 *     between midnight, January 1, 1970 and the current time.
 */
goog.now = Date.now || (function() {
  // Unary plus operator converts its operand to a number which in the case of
  // a date is done by calling getTime().
  return +new Date();
});


/**
 * Evals javascript in the global scope.  In IE this uses execScript, other
 * browsers use goog.global.eval. If goog.global.eval does not evaluate in the
 * global scope (for example, in Safari), appends a script tag instead.
 * Throws an exception if neither execScript or eval is defined.
 * @param {string} script JavaScript string.
 */
goog.globalEval = function(script) {
  if (goog.global.execScript) {
    goog.global.execScript(script, 'JavaScript');
  } else if (goog.global.eval) {
    // Test to see if eval works
    if (goog.evalWorksForGlobals_ == null) {
      goog.global.eval('var _et_ = 1;');
      if (typeof goog.global['_et_'] != 'undefined') {
        delete goog.global['_et_'];
        goog.evalWorksForGlobals_ = true;
      } else {
        goog.evalWorksForGlobals_ = false;
      }
    }

    if (goog.evalWorksForGlobals_) {
      goog.global.eval(script);
    } else {
      var doc = goog.global.document;
      var scriptElt = doc.createElement('script');
      scriptElt.type = 'text/javascript';
      scriptElt.defer = false;
      // Note(user): can't use .innerHTML since "t('<test>')" will fail and
      // .text doesn't work in Safari 2.  Therefore we append a text node.
      scriptElt.appendChild(doc.createTextNode(script));
      doc.body.appendChild(scriptElt);
      doc.body.removeChild(scriptElt);
    }
  } else {
    throw Error('goog.globalEval not available');
  }
};


/**
 * Indicates whether or not we can call 'eval' directly to eval code in the
 * global scope. Set to a Boolean by the first call to goog.globalEval (which
 * empirically tests whether eval works for globals). @see goog.globalEval
 * @type {?boolean}
 * @private
 */
goog.evalWorksForGlobals_ = null;


/**
 * Optional map of CSS class names to obfuscated names used with
 * goog.getCssName().
 * @type {Object|undefined}
 * @private
 * @see goog.setCssNameMapping
 */
goog.cssNameMapping_;


/**
 * Optional obfuscation style for CSS class names. Should be set to either
 * 'BY_WHOLE' or 'BY_PART' if defined.
 * @type {string|undefined}
 * @private
 * @see goog.setCssNameMapping
 */
goog.cssNameMappingStyle_;


/**
 * Handles strings that are intended to be used as CSS class names.
 *
 * This function works in tandem with @see goog.setCssNameMapping.
 *
 * Without any mapping set, the arguments are simple joined with a
 * hyphen and passed through unaltered.
 *
 * When there is a mapping, there are two possible styles in which
 * these mappings are used. In the BY_PART style, each part (i.e. in
 * between hyphens) of the passed in css name is rewritten according
 * to the map. In the BY_WHOLE style, the full css name is looked up in
 * the map directly. If a rewrite is not specified by the map, the
 * compiler will output a warning.
 *
 * When the mapping is passed to the compiler, it will replace calls
 * to goog.getCssName with the strings from the mapping, e.g.
 *     var x = goog.getCssName('foo');
 *     var y = goog.getCssName(this.baseClass, 'active');
 *  becomes:
 *     var x= 'foo';
 *     var y = this.baseClass + '-active';
 *
 * If one argument is passed it will be processed, if two are passed
 * only the modifier will be processed, as it is assumed the first
 * argument was generated as a result of calling goog.getCssName.
 *
 * @param {string} className The class name.
 * @param {string=} opt_modifier A modifier to be appended to the class name.
 * @return {string} The class name or the concatenation of the class name and
 *     the modifier.
 */
goog.getCssName = function(className, opt_modifier) {
  var getMapping = function(cssName) {
    return goog.cssNameMapping_[cssName] || cssName;
  };

  var renameByParts = function(cssName) {
    // Remap all the parts individually.
    var parts = cssName.split('-');
    var mapped = [];
    for (var i = 0; i < parts.length; i++) {
      mapped.push(getMapping(parts[i]));
    }
    return mapped.join('-');
  };

  var rename;
  if (goog.cssNameMapping_) {
    rename = goog.cssNameMappingStyle_ == 'BY_WHOLE' ?
        getMapping : renameByParts;
  } else {
    rename = function(a) {
      return a;
    };
  }

  if (opt_modifier) {
    return className + '-' + rename(opt_modifier);
  } else {
    return rename(className);
  }
};


/**
 * Sets the map to check when returning a value from goog.getCssName(). Example:
 * <pre>
 * goog.setCssNameMapping({
 *   "goog": "a",
 *   "disabled": "b",
 * });
 *
 * var x = goog.getCssName('goog');
 * // The following evaluates to: "a a-b".
 * goog.getCssName('goog') + ' ' + goog.getCssName(x, 'disabled')
 * </pre>
 * When declared as a map of string literals to string literals, the JSCompiler
 * will replace all calls to goog.getCssName() using the supplied map if the
 * --closure_pass flag is set.
 *
 * @param {!Object} mapping A map of strings to strings where keys are possible
 *     arguments to goog.getCssName() and values are the corresponding values
 *     that should be returned.
 * @param {string=} opt_style The style of css name mapping. There are two valid
 *     options: 'BY_PART', and 'BY_WHOLE'.
 * @see goog.getCssName for a description.
 */
goog.setCssNameMapping = function(mapping, opt_style) {
  goog.cssNameMapping_ = mapping;
  goog.cssNameMappingStyle_ = opt_style;
};


/**
 * To use CSS renaming in compiled mode, one of the input files should have a
 * call to goog.setCssNameMapping() with an object literal that the JSCompiler
 * can extract and use to replace all calls to goog.getCssName(). In uncompiled
 * mode, JavaScript code should be loaded before this base.js file that declares
 * a global variable, CLOSURE_CSS_NAME_MAPPING, which is used below. This is
 * to ensure that the mapping is loaded before any calls to goog.getCssName()
 * are made in uncompiled mode.
 *
 * A hook for overriding the CSS name mapping.
 * @type {Object|undefined}
 */
goog.global.CLOSURE_CSS_NAME_MAPPING;


if (!COMPILED && goog.global.CLOSURE_CSS_NAME_MAPPING) {
  // This does not call goog.setCssNameMapping() because the JSCompiler
  // requires that goog.setCssNameMapping() be called with an object literal.
  goog.cssNameMapping_ = goog.global.CLOSURE_CSS_NAME_MAPPING;
}


/**
 * Abstract implementation of goog.getMsg for use with localized messages.
 * @param {string} str Translatable string, places holders in the form {$foo}.
 * @param {Object=} opt_values Map of place holder name to value.
 * @return {string} message with placeholders filled.
 */
goog.getMsg = function(str, opt_values) {
  var values = opt_values || {};
  for (var key in values) {
    var value = ('' + values[key]).replace(/\$/g, '$$$$');
    str = str.replace(new RegExp('\\{\\$' + key + '\\}', 'gi'), value);
  }
  return str;
};


/**
 * Exposes an unobfuscated global namespace path for the given object.
 * Note that fields of the exported object *will* be obfuscated,
 * unless they are exported in turn via this function or
 * goog.exportProperty
 *
 * <p>Also handy for making public items that are defined in anonymous
 * closures.
 *
 * ex. goog.exportSymbol('Foo', Foo);
 *
 * ex. goog.exportSymbol('public.path.Foo.staticFunction',
 *                       Foo.staticFunction);
 *     public.path.Foo.staticFunction();
 *
 * ex. goog.exportSymbol('public.path.Foo.prototype.myMethod',
 *                       Foo.prototype.myMethod);
 *     new public.path.Foo().myMethod();
 *
 * @param {string} publicPath Unobfuscated name to export.
 * @param {*} object Object the name should point to.
 * @param {Object=} opt_objectToExportTo The object to add the path to; default
 *     is |goog.global|.
 */
goog.exportSymbol = function(publicPath, object, opt_objectToExportTo) {
  goog.exportPath_(publicPath, object, opt_objectToExportTo);
};


/**
 * Exports a property unobfuscated into the object's namespace.
 * ex. goog.exportProperty(Foo, 'staticFunction', Foo.staticFunction);
 * ex. goog.exportProperty(Foo.prototype, 'myMethod', Foo.prototype.myMethod);
 * @param {Object} object Object whose static property is being exported.
 * @param {string} publicName Unobfuscated name to export.
 * @param {*} symbol Object the name should point to.
 */
goog.exportProperty = function(object, publicName, symbol) {
  object[publicName] = symbol;
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * Usage:
 * <pre>
 * function ParentClass(a, b) { }
 * ParentClass.prototype.foo = function(a) { }
 *
 * function ChildClass(a, b, c) {
 *   goog.base(this, a, b);
 * }
 * goog.inherits(ChildClass, ParentClass);
 *
 * var child = new ChildClass('a', 'b', 'see');
 * child.foo(); // works
 * </pre>
 *
 * In addition, a superclass' implementation of a method can be invoked
 * as follows:
 *
 * <pre>
 * ChildClass.prototype.foo = function(a) {
 *   ChildClass.superClass_.foo.call(this, a);
 *   // other code
 * };
 * </pre>
 *
 * @param {Function} childCtor Child class.
 * @param {Function} parentCtor Parent class.
 */
goog.inherits = function(childCtor, parentCtor) {
  /** @constructor */
  function tempCtor() {};
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor();
  childCtor.prototype.constructor = childCtor;
};


/**
 * Call up to the superclass.
 *
 * If this is called from a constructor, then this calls the superclass
 * contructor with arguments 1-N.
 *
 * If this is called from a prototype method, then you must pass
 * the name of the method as the second argument to this function. If
 * you do not, you will get a runtime error. This calls the superclass'
 * method with arguments 2-N.
 *
 * This function only works if you use goog.inherits to express
 * inheritance relationships between your classes.
 *
 * This function is a compiler primitive. At compile-time, the
 * compiler will do macro expansion to remove a lot of
 * the extra overhead that this function introduces. The compiler
 * will also enforce a lot of the assumptions that this function
 * makes, and treat it as a compiler error if you break them.
 *
 * @param {!Object} me Should always be "this".
 * @param {*=} opt_methodName The method name if calling a super method.
 * @param {...*} var_args The rest of the arguments.
 * @return {*} The return value of the superclass method.
 */
goog.base = function(me, opt_methodName, var_args) {
  var caller = arguments.callee.caller;
  if (caller.superClass_) {
    // This is a constructor. Call the superclass constructor.
    return caller.superClass_.constructor.apply(
        me, Array.prototype.slice.call(arguments, 1));
  }

  var args = Array.prototype.slice.call(arguments, 2);
  var foundCaller = false;
  for (var ctor = me.constructor;
       ctor; ctor = ctor.superClass_ && ctor.superClass_.constructor) {
    if (ctor.prototype[opt_methodName] === caller) {
      foundCaller = true;
    } else if (foundCaller) {
      return ctor.prototype[opt_methodName].apply(me, args);
    }
  }

  // If we did not find the caller in the prototype chain,
  // then one of two things happened:
  // 1) The caller is an instance method.
  // 2) This method was not called by the right caller.
  if (me[opt_methodName] === caller) {
    return me.constructor.prototype[opt_methodName].apply(me, args);
  } else {
    throw Error(
        'goog.base called from a method of one name ' +
        'to a method of a different name');
  }
};


/**
 * Allow for aliasing within scope functions.  This function exists for
 * uncompiled code - in compiled code the calls will be inlined and the
 * aliases applied.  In uncompiled code the function is simply run since the
 * aliases as written are valid JavaScript.
 * @param {function()} fn Function to call.  This function can contain aliases
 *     to namespaces (e.g. "var dom = goog.dom") or classes
 *    (e.g. "var Timer = goog.Timer").
 */
goog.scope = function(fn) {
  fn.call(goog.global);
};


/**
 * @fileoverview gl-matrix - High performance matrix and vector operations for WebGL
 * @author Brandon Jones
 * @version 1.2.4
 */

/*
 * Copyright (c) 2011 Brandon Jones
 *
 * This software is provided 'as-is', without any express or implied
 * warranty. In no event will the authors be held liable for any damages
 * arising from the use of this software.
 *
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 *
 *    1. The origin of this software must not be misrepresented; you must not
 *    claim that you wrote the original software. If you use this software
 *    in a product, an acknowledgment in the product documentation would be
 *    appreciated but is not required.
 *
 *    2. Altered source versions must be plainly marked as such, and must not
 *    be misrepresented as being the original software.
 *
 *    3. This notice may not be removed or altered from any source
 *    distribution.
 */

"use strict";


goog.provide("mat4");
goog.provide("vec2");
goog.provide("vec3");
goog.provide("quat4");

// Type declarations
(function(_global) {
    // account for CommonJS environments
    _global['glMatrixArrayType'] = _global['MatrixArray'] = null;

    // explicitly sets and returns the type of array to use within glMatrix
    _global['setMatrixArrayType'] = function(type) {
        return _global['glMatrixArrayType'] = _global['MatrixArray'] = type;
    };

    // auto-detects and returns the best type of array to use within glMatrix, falling
    // back to Array if typed arrays are unsupported
    _global['determineMatrixArrayType'] = function() {
        return _global['setMatrixArrayType']((typeof Float32Array !== 'undefined') ? Float32Array : Array);
    };

    _global['determineMatrixArrayType']();
})((typeof(exports) != 'undefined') ? global : window);

/**
 * @class 3 Dimensional Vector
 * @name vec3
 */
vec3 = {};

/**
 * @class 3x3 Matrix
 * @name mat3
 */
mat3 = {};

/**
 * @class 4x4 Matrix
 * @name mat4
 */
mat4 = {};

/**
 * @class Quaternion
 * @name quat4
 */
quat4 = {};

/*
 * vec3
 */

/**
 * Creates a new instance of a vec3 using the default array type
 * Any javascript array-like objects containing at least 3 numeric elements can serve as a vec3
 *
 * @param {vec3} [vec] vec3 containing values to initialize with
 *
 * @returns {vec3} New vec3
 */
vec3.create = function (vec) {
    var dest = new MatrixArray(3);

    if (vec) {
        dest[0] = vec[0];
        dest[1] = vec[1];
        dest[2] = vec[2];
    } else {
        dest[0] = dest[1] = dest[2] = 0;
    }

    return dest;
};

/**
 * Copies the values of one vec3 to another
 *
 * @param {vec3} vec vec3 containing values to copy
 * @param {vec3} dest vec3 receiving copied values
 *
 * @returns {vec3} dest
 */
vec3.set = function (vec, dest) {
    dest[0] = vec[0];
    dest[1] = vec[1];
    dest[2] = vec[2];

    return dest;
};

/**
 * Performs a vector addition
 *
 * @param {vec3} vec First operand
 * @param {vec3} vec2 Second operand
 * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
 *
 * @returns {vec3} dest if specified, vec otherwise
 */
vec3.add = function (vec, vec2, dest) {
    if (!dest || vec === dest) {
        vec[0] += vec2[0];
        vec[1] += vec2[1];
        vec[2] += vec2[2];
        return vec;
    }

    dest[0] = vec[0] + vec2[0];
    dest[1] = vec[1] + vec2[1];
    dest[2] = vec[2] + vec2[2];
    return dest;
};

/**
 * Performs a vector subtraction
 *
 * @param {vec3} vec First operand
 * @param {vec3} vec2 Second operand
 * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
 *
 * @returns {vec3} dest if specified, vec otherwise
 */
vec3.subtract = function (vec, vec2, dest) {
    if (!dest || vec === dest) {
        vec[0] -= vec2[0];
        vec[1] -= vec2[1];
        vec[2] -= vec2[2];
        return vec;
    }

    dest[0] = vec[0] - vec2[0];
    dest[1] = vec[1] - vec2[1];
    dest[2] = vec[2] - vec2[2];
    return dest;
};

/**
 * Performs a vector multiplication
 *
 * @param {vec3} vec First operand
 * @param {vec3} vec2 Second operand
 * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
 *
 * @returns {vec3} dest if specified, vec otherwise
 */
vec3.multiply = function (vec, vec2, dest) {
    if (!dest || vec === dest) {
        vec[0] *= vec2[0];
        vec[1] *= vec2[1];
        vec[2] *= vec2[2];
        return vec;
    }

    dest[0] = vec[0] * vec2[0];
    dest[1] = vec[1] * vec2[1];
    dest[2] = vec[2] * vec2[2];
    return dest;
};

/**
 * Negates the components of a vec3
 *
 * @param {vec3} vec vec3 to negate
 * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
 *
 * @returns {vec3} dest if specified, vec otherwise
 */
vec3.negate = function (vec, dest) {
    if (!dest) { dest = vec; }

    dest[0] = -vec[0];
    dest[1] = -vec[1];
    dest[2] = -vec[2];
    return dest;
};

/**
 * Multiplies the components of a vec3 by a scalar value
 *
 * @param {vec3} vec vec3 to scale
 * @param {number} val Value to scale by
 * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
 *
 * @returns {vec3} dest if specified, vec otherwise
 */
vec3.scale = function (vec, val, dest) {
    if (!dest || vec === dest) {
        vec[0] *= val;
        vec[1] *= val;
        vec[2] *= val;
        return vec;
    }

    dest[0] = vec[0] * val;
    dest[1] = vec[1] * val;
    dest[2] = vec[2] * val;
    return dest;
};

/**
 * Generates a unit vector of the same direction as the provided vec3
 * If vector length is 0, returns [0, 0, 0]
 *
 * @param {vec3} vec vec3 to normalize
 * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
 *
 * @returns {vec3} dest if specified, vec otherwise
 */
vec3.normalize = function (vec, dest) {
    if (!dest) { dest = vec; }

    var x = vec[0], y = vec[1], z = vec[2],
        len = Math.sqrt(x * x + y * y + z * z);

    if (!len) {
        dest[0] = 0;
        dest[1] = 0;
        dest[2] = 0;
        return dest;
    } else if (len === 1) {
        dest[0] = x;
        dest[1] = y;
        dest[2] = z;
        return dest;
    }

    len = 1 / len;
    dest[0] = x * len;
    dest[1] = y * len;
    dest[2] = z * len;
    return dest;
};

/**
 * Generates the cross product of two vec3s
 *
 * @param {vec3} vec First operand
 * @param {vec3} vec2 Second operand
 * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
 *
 * @returns {vec3} dest if specified, vec otherwise
 */
vec3.cross = function (vec, vec2, dest) {
    if (!dest) { dest = vec; }

    var x = vec[0], y = vec[1], z = vec[2],
        x2 = vec2[0], y2 = vec2[1], z2 = vec2[2];

    dest[0] = y * z2 - z * y2;
    dest[1] = z * x2 - x * z2;
    dest[2] = x * y2 - y * x2;
    return dest;
};

/**
 * Caclulates the length of a vec3
 *
 * @param {vec3} vec vec3 to calculate length of
 *
 * @returns {number} Length of vec
 */
vec3.length = function (vec) {
    var x = vec[0], y = vec[1], z = vec[2];
    return Math.sqrt(x * x + y * y + z * z);
};

/**
 * Caclulates the dot product of two vec3s
 *
 * @param {vec3} vec First operand
 * @param {vec3} vec2 Second operand
 *
 * @returns {number} Dot product of vec and vec2
 */
vec3.dot = function (vec, vec2) {
    return vec[0] * vec2[0] + vec[1] * vec2[1] + vec[2] * vec2[2];
};

/**
 * Generates a unit vector pointing from one vector to another
 *
 * @param {vec3} vec Origin vec3
 * @param {vec3} vec2 vec3 to point to
 * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
 *
 * @returns {vec3} dest if specified, vec otherwise
 */
vec3.direction = function (vec, vec2, dest) {
    if (!dest) { dest = vec; }

    var x = vec[0] - vec2[0],
        y = vec[1] - vec2[1],
        z = vec[2] - vec2[2],
        len = Math.sqrt(x * x + y * y + z * z);

    if (!len) {
        dest[0] = 0;
        dest[1] = 0;
        dest[2] = 0;
        return dest;
    }

    len = 1 / len;
    dest[0] = x * len;
    dest[1] = y * len;
    dest[2] = z * len;
    return dest;
};

/**
 * Performs a linear interpolation between two vec3
 *
 * @param {vec3} vec First vector
 * @param {vec3} vec2 Second vector
 * @param {number} lerp Interpolation amount between the two inputs
 * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
 *
 * @returns {vec3} dest if specified, vec otherwise
 */
vec3.lerp = function (vec, vec2, lerp, dest) {
    if (!dest) { dest = vec; }

    dest[0] = vec[0] + lerp * (vec2[0] - vec[0]);
    dest[1] = vec[1] + lerp * (vec2[1] - vec[1]);
    dest[2] = vec[2] + lerp * (vec2[2] - vec[2]);

    return dest;
};

/**
 * Calculates the euclidian distance between two vec3
 *
 * Params:
 * @param {vec3} vec First vector
 * @param {vec3} vec2 Second vector
 *
 * @returns {number} Distance between vec and vec2
 */
vec3.dist = function (vec, vec2) {
    var x = vec2[0] - vec[0],
        y = vec2[1] - vec[1],
        z = vec2[2] - vec[2];

    return Math.sqrt(x*x + y*y + z*z);
};

/**
 * Projects the specified vec3 from screen space into object space
 * Based on the <a href="http://webcvs.freedesktop.org/mesa/Mesa/src/glu/mesa/project.c?revision=1.4&view=markup">Mesa gluUnProject implementation</a>
 *
 * @param {vec3} vec Screen-space vector to project
 * @param {mat4} view View matrix
 * @param {mat4} proj Projection matrix
 * @param {vec4} viewport Viewport as given to gl.viewport [x, y, width, height]
 * @param {vec3} [dest] vec3 receiving unprojected result. If not specified result is written to vec
 *
 * @returns {vec3} dest if specified, vec otherwise
 */
vec3.unproject = function (vec, view, proj, viewport, dest) {
    if (!dest) { dest = vec; }

    var m = mat4.create();
    var v = new MatrixArray(4);

    v[0] = (vec[0] - viewport[0]) * 2.0 / viewport[2] - 1.0;
    v[1] = (vec[1] - viewport[1]) * 2.0 / viewport[3] - 1.0;
    v[2] = 2.0 * vec[2] - 1.0;
    v[3] = 1.0;

    mat4.multiply(proj, view, m);
    if(!mat4.inverse(m)) { return null; }

    mat4.multiplyVec4(m, v);
    if(v[3] === 0.0) { return null; }

    dest[0] = v[0] / v[3];
    dest[1] = v[1] / v[3];
    dest[2] = v[2] / v[3];

    return dest;
};

/**
 * Returns a string representation of a vector
 *
 * @param {vec3} vec Vector to represent as a string
 *
 * @returns {string} String representation of vec
 */
vec3.str = function (vec) {
    return '[' + vec[0] + ', ' + vec[1] + ', ' + vec[2] + ']';
};

/*
 * mat3
 */

/**
 * Creates a new instance of a mat3 using the default array type
 * Any javascript array-like object containing at least 9 numeric elements can serve as a mat3
 *
 * @param {mat3} [mat] mat3 containing values to initialize with
 *
 * @returns {mat3} New mat3
 */
mat3.create = function (mat) {
    var dest = new MatrixArray(9);

    if (mat) {
        dest[0] = mat[0];
        dest[1] = mat[1];
        dest[2] = mat[2];
        dest[3] = mat[3];
        dest[4] = mat[4];
        dest[5] = mat[5];
        dest[6] = mat[6];
        dest[7] = mat[7];
        dest[8] = mat[8];
    }

    return dest;
};

/**
 * Copies the values of one mat3 to another
 *
 * @param {mat3} mat mat3 containing values to copy
 * @param {mat3} dest mat3 receiving copied values
 *
 * @returns {mat3} dest
 */
mat3.set = function (mat, dest) {
    dest[0] = mat[0];
    dest[1] = mat[1];
    dest[2] = mat[2];
    dest[3] = mat[3];
    dest[4] = mat[4];
    dest[5] = mat[5];
    dest[6] = mat[6];
    dest[7] = mat[7];
    dest[8] = mat[8];
    return dest;
};

/**
 * Sets a mat3 to an identity matrix
 *
 * @param {mat3} dest mat3 to set
 *
 * @returns dest if specified, otherwise a new mat3
 */
mat3.identity = function (dest) {
    if (!dest) { dest = mat3.create(); }
    dest[0] = 1;
    dest[1] = 0;
    dest[2] = 0;
    dest[3] = 0;
    dest[4] = 1;
    dest[5] = 0;
    dest[6] = 0;
    dest[7] = 0;
    dest[8] = 1;
    return dest;
};

/**
 * Transposes a mat3 (flips the values over the diagonal)
 *
 * Params:
 * @param {mat3} mat mat3 to transpose
 * @param {mat3} [dest] mat3 receiving transposed values. If not specified result is written to mat
 *
 * @returns {mat3} dest is specified, mat otherwise
 */
mat3.transpose = function (mat, dest) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (!dest || mat === dest) {
        var a01 = mat[1], a02 = mat[2],
            a12 = mat[5];

        mat[1] = mat[3];
        mat[2] = mat[6];
        mat[3] = a01;
        mat[5] = mat[7];
        mat[6] = a02;
        mat[7] = a12;
        return mat;
    }

    dest[0] = mat[0];
    dest[1] = mat[3];
    dest[2] = mat[6];
    dest[3] = mat[1];
    dest[4] = mat[4];
    dest[5] = mat[7];
    dest[6] = mat[2];
    dest[7] = mat[5];
    dest[8] = mat[8];
    return dest;
};

/**
 * Copies the elements of a mat3 into the upper 3x3 elements of a mat4
 *
 * @param {mat3} mat mat3 containing values to copy
 * @param {mat4} [dest] mat4 receiving copied values
 *
 * @returns {mat4} dest if specified, a new mat4 otherwise
 */
mat3.toMat4 = function (mat, dest) {
    if (!dest) { dest = mat4.create(); }

    dest[15] = 1;
    dest[14] = 0;
    dest[13] = 0;
    dest[12] = 0;

    dest[11] = 0;
    dest[10] = mat[8];
    dest[9] = mat[7];
    dest[8] = mat[6];

    dest[7] = 0;
    dest[6] = mat[5];
    dest[5] = mat[4];
    dest[4] = mat[3];

    dest[3] = 0;
    dest[2] = mat[2];
    dest[1] = mat[1];
    dest[0] = mat[0];

    return dest;
};

/**
 * Returns a string representation of a mat3
 *
 * @param {mat3} mat mat3 to represent as a string
 *
 * @param {string} String representation of mat
 */
mat3.str = function (mat) {
    return '[' + mat[0] + ', ' + mat[1] + ', ' + mat[2] +
        ', ' + mat[3] + ', ' + mat[4] + ', ' + mat[5] +
        ', ' + mat[6] + ', ' + mat[7] + ', ' + mat[8] + ']';
};

/*
 * mat4
 */

/**
 * Creates a new instance of a mat4 using the default array type
 * Any javascript array-like object containing at least 16 numeric elements can serve as a mat4
 *
 * @param {mat4} [mat] mat4 containing values to initialize with
 *
 * @returns {mat4} New mat4
 */
mat4.create = function (mat) {
    var dest = new MatrixArray(16);

    if (mat) {
        dest[0] = mat[0];
        dest[1] = mat[1];
        dest[2] = mat[2];
        dest[3] = mat[3];
        dest[4] = mat[4];
        dest[5] = mat[5];
        dest[6] = mat[6];
        dest[7] = mat[7];
        dest[8] = mat[8];
        dest[9] = mat[9];
        dest[10] = mat[10];
        dest[11] = mat[11];
        dest[12] = mat[12];
        dest[13] = mat[13];
        dest[14] = mat[14];
        dest[15] = mat[15];
    }

    return dest;
};

/**
 * Copies the values of one mat4 to another
 *
 * @param {mat4} mat mat4 containing values to copy
 * @param {mat4} dest mat4 receiving copied values
 *
 * @returns {mat4} dest
 */
mat4.set = function (mat, dest) {
    dest[0] = mat[0];
    dest[1] = mat[1];
    dest[2] = mat[2];
    dest[3] = mat[3];
    dest[4] = mat[4];
    dest[5] = mat[5];
    dest[6] = mat[6];
    dest[7] = mat[7];
    dest[8] = mat[8];
    dest[9] = mat[9];
    dest[10] = mat[10];
    dest[11] = mat[11];
    dest[12] = mat[12];
    dest[13] = mat[13];
    dest[14] = mat[14];
    dest[15] = mat[15];
    return dest;
};

/**
 * Sets a mat4 to an identity matrix
 *
 * @param {mat4} dest mat4 to set
 *
 * @returns {mat4} dest
 */
mat4.identity = function (dest) {
    if (!dest) { dest = mat4.create(); }
    dest[0] = 1;
    dest[1] = 0;
    dest[2] = 0;
    dest[3] = 0;
    dest[4] = 0;
    dest[5] = 1;
    dest[6] = 0;
    dest[7] = 0;
    dest[8] = 0;
    dest[9] = 0;
    dest[10] = 1;
    dest[11] = 0;
    dest[12] = 0;
    dest[13] = 0;
    dest[14] = 0;
    dest[15] = 1;
    return dest;
};

/**
 * Transposes a mat4 (flips the values over the diagonal)
 *
 * @param {mat4} mat mat4 to transpose
 * @param {mat4} [dest] mat4 receiving transposed values. If not specified result is written to mat
 *
 * @param {mat4} dest is specified, mat otherwise
 */
mat4.transpose = function (mat, dest) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (!dest || mat === dest) {
        var a01 = mat[1], a02 = mat[2], a03 = mat[3],
            a12 = mat[6], a13 = mat[7],
            a23 = mat[11];

        mat[1] = mat[4];
        mat[2] = mat[8];
        mat[3] = mat[12];
        mat[4] = a01;
        mat[6] = mat[9];
        mat[7] = mat[13];
        mat[8] = a02;
        mat[9] = a12;
        mat[11] = mat[14];
        mat[12] = a03;
        mat[13] = a13;
        mat[14] = a23;
        return mat;
    }

    dest[0] = mat[0];
    dest[1] = mat[4];
    dest[2] = mat[8];
    dest[3] = mat[12];
    dest[4] = mat[1];
    dest[5] = mat[5];
    dest[6] = mat[9];
    dest[7] = mat[13];
    dest[8] = mat[2];
    dest[9] = mat[6];
    dest[10] = mat[10];
    dest[11] = mat[14];
    dest[12] = mat[3];
    dest[13] = mat[7];
    dest[14] = mat[11];
    dest[15] = mat[15];
    return dest;
};

/**
 * Calculates the determinant of a mat4
 *
 * @param {mat4} mat mat4 to calculate determinant of
 *
 * @returns {number} determinant of mat
 */
mat4.determinant = function (mat) {
    // Cache the matrix values (makes for huge speed increases!)
    var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3],
        a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7],
        a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11],
        a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15];

    return (a30 * a21 * a12 * a03 - a20 * a31 * a12 * a03 - a30 * a11 * a22 * a03 + a10 * a31 * a22 * a03 +
        a20 * a11 * a32 * a03 - a10 * a21 * a32 * a03 - a30 * a21 * a02 * a13 + a20 * a31 * a02 * a13 +
        a30 * a01 * a22 * a13 - a00 * a31 * a22 * a13 - a20 * a01 * a32 * a13 + a00 * a21 * a32 * a13 +
        a30 * a11 * a02 * a23 - a10 * a31 * a02 * a23 - a30 * a01 * a12 * a23 + a00 * a31 * a12 * a23 +
        a10 * a01 * a32 * a23 - a00 * a11 * a32 * a23 - a20 * a11 * a02 * a33 + a10 * a21 * a02 * a33 +
        a20 * a01 * a12 * a33 - a00 * a21 * a12 * a33 - a10 * a01 * a22 * a33 + a00 * a11 * a22 * a33);
};

/**
 * Calculates the inverse matrix of a mat4
 *
 * @param {mat4} mat mat4 to calculate inverse of
 * @param {mat4} [dest] mat4 receiving inverse matrix. If not specified result is written to mat
 *
 * @param {mat4} dest is specified, mat otherwise, null if matrix cannot be inverted
 */
mat4.inverse = function (mat, dest) {
    if (!dest) { dest = mat; }

    // Cache the matrix values (makes for huge speed increases!)
    var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3],
        a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7],
        a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11],
        a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32,

        d = (b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06),
        invDet;

    // Calculate the determinant
    if (!d) { return null; }
    invDet = 1 / d;

    dest[0] = (a11 * b11 - a12 * b10 + a13 * b09) * invDet;
    dest[1] = (-a01 * b11 + a02 * b10 - a03 * b09) * invDet;
    dest[2] = (a31 * b05 - a32 * b04 + a33 * b03) * invDet;
    dest[3] = (-a21 * b05 + a22 * b04 - a23 * b03) * invDet;
    dest[4] = (-a10 * b11 + a12 * b08 - a13 * b07) * invDet;
    dest[5] = (a00 * b11 - a02 * b08 + a03 * b07) * invDet;
    dest[6] = (-a30 * b05 + a32 * b02 - a33 * b01) * invDet;
    dest[7] = (a20 * b05 - a22 * b02 + a23 * b01) * invDet;
    dest[8] = (a10 * b10 - a11 * b08 + a13 * b06) * invDet;
    dest[9] = (-a00 * b10 + a01 * b08 - a03 * b06) * invDet;
    dest[10] = (a30 * b04 - a31 * b02 + a33 * b00) * invDet;
    dest[11] = (-a20 * b04 + a21 * b02 - a23 * b00) * invDet;
    dest[12] = (-a10 * b09 + a11 * b07 - a12 * b06) * invDet;
    dest[13] = (a00 * b09 - a01 * b07 + a02 * b06) * invDet;
    dest[14] = (-a30 * b03 + a31 * b01 - a32 * b00) * invDet;
    dest[15] = (a20 * b03 - a21 * b01 + a22 * b00) * invDet;

    return dest;
};

/**
 * Copies the upper 3x3 elements of a mat4 into another mat4
 *
 * @param {mat4} mat mat4 containing values to copy
 * @param {mat4} [dest] mat4 receiving copied values
 *
 * @returns {mat4} dest is specified, a new mat4 otherwise
 */
mat4.toRotationMat = function (mat, dest) {
    if (!dest) { dest = mat4.create(); }

    dest[0] = mat[0];
    dest[1] = mat[1];
    dest[2] = mat[2];
    dest[3] = mat[3];
    dest[4] = mat[4];
    dest[5] = mat[5];
    dest[6] = mat[6];
    dest[7] = mat[7];
    dest[8] = mat[8];
    dest[9] = mat[9];
    dest[10] = mat[10];
    dest[11] = mat[11];
    dest[12] = 0;
    dest[13] = 0;
    dest[14] = 0;
    dest[15] = 1;

    return dest;
};

/**
 * Copies the upper 3x3 elements of a mat4 into a mat3
 *
 * @param {mat4} mat mat4 containing values to copy
 * @param {mat3} [dest] mat3 receiving copied values
 *
 * @returns {mat3} dest is specified, a new mat3 otherwise
 */
mat4.toMat3 = function (mat, dest) {
    if (!dest) { dest = mat3.create(); }

    dest[0] = mat[0];
    dest[1] = mat[1];
    dest[2] = mat[2];
    dest[3] = mat[4];
    dest[4] = mat[5];
    dest[5] = mat[6];
    dest[6] = mat[8];
    dest[7] = mat[9];
    dest[8] = mat[10];

    return dest;
};

/**
 * Calculates the inverse of the upper 3x3 elements of a mat4 and copies the result into a mat3
 * The resulting matrix is useful for calculating transformed normals
 *
 * Params:
 * @param {mat4} mat mat4 containing values to invert and copy
 * @param {mat3} [dest] mat3 receiving values
 *
 * @returns {mat3} dest is specified, a new mat3 otherwise, null if the matrix cannot be inverted
 */
mat4.toInverseMat3 = function (mat, dest) {
    // Cache the matrix values (makes for huge speed increases!)
    var a00 = mat[0], a01 = mat[1], a02 = mat[2],
        a10 = mat[4], a11 = mat[5], a12 = mat[6],
        a20 = mat[8], a21 = mat[9], a22 = mat[10],

        b01 = a22 * a11 - a12 * a21,
        b11 = -a22 * a10 + a12 * a20,
        b21 = a21 * a10 - a11 * a20,

        d = a00 * b01 + a01 * b11 + a02 * b21,
        id;

    if (!d) { return null; }
    id = 1 / d;

    if (!dest) { dest = mat3.create(); }

    dest[0] = b01 * id;
    dest[1] = (-a22 * a01 + a02 * a21) * id;
    dest[2] = (a12 * a01 - a02 * a11) * id;
    dest[3] = b11 * id;
    dest[4] = (a22 * a00 - a02 * a20) * id;
    dest[5] = (-a12 * a00 + a02 * a10) * id;
    dest[6] = b21 * id;
    dest[7] = (-a21 * a00 + a01 * a20) * id;
    dest[8] = (a11 * a00 - a01 * a10) * id;

    return dest;
};

/**
 * Performs a matrix multiplication
 *
 * @param {mat4} mat First operand
 * @param {mat4} mat2 Second operand
 * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to mat
 *
 * @returns {mat4} dest if specified, mat otherwise
 */
mat4.multiply = function (mat, mat2, dest) {
    if (!dest) { dest = mat; }

    // Cache the matrix values (makes for huge speed increases!)
    var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3],
        a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7],
        a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11],
        a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15],

        b00 = mat2[0], b01 = mat2[1], b02 = mat2[2], b03 = mat2[3],
        b10 = mat2[4], b11 = mat2[5], b12 = mat2[6], b13 = mat2[7],
        b20 = mat2[8], b21 = mat2[9], b22 = mat2[10], b23 = mat2[11],
        b30 = mat2[12], b31 = mat2[13], b32 = mat2[14], b33 = mat2[15];

    dest[0] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
    dest[1] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
    dest[2] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
    dest[3] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;
    dest[4] = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30;
    dest[5] = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31;
    dest[6] = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32;
    dest[7] = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33;
    dest[8] = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30;
    dest[9] = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31;
    dest[10] = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32;
    dest[11] = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33;
    dest[12] = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30;
    dest[13] = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31;
    dest[14] = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32;
    dest[15] = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33;

    return dest;
};

/**
 * Transforms a vec3 with the given matrix
 * 4th vector component is implicitly '1'
 *
 * @param {mat4} mat mat4 to transform the vector with
 * @param {vec3} vec vec3 to transform
 * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
 *
 * @returns {vec3} dest if specified, vec otherwise
 */
mat4.multiplyVec3 = function (mat, vec, dest) {
    if (!dest) { dest = vec; }

    var x = vec[0], y = vec[1], z = vec[2];

    dest[0] = mat[0] * x + mat[4] * y + mat[8] * z + mat[12];
    dest[1] = mat[1] * x + mat[5] * y + mat[9] * z + mat[13];
    dest[2] = mat[2] * x + mat[6] * y + mat[10] * z + mat[14];

    return dest;
};

/**
 * Transforms a vec4 with the given matrix
 *
 * @param {mat4} mat mat4 to transform the vector with
 * @param {vec4} vec vec4 to transform
 * @param {vec4} [dest] vec4 receiving operation result. If not specified result is written to vec
 *
 * @returns {vec4} dest if specified, vec otherwise
 */
mat4.multiplyVec4 = function (mat, vec, dest) {
    if (!dest) { dest = vec; }

    var x = vec[0], y = vec[1], z = vec[2], w = vec[3];

    dest[0] = mat[0] * x + mat[4] * y + mat[8] * z + mat[12] * w;
    dest[1] = mat[1] * x + mat[5] * y + mat[9] * z + mat[13] * w;
    dest[2] = mat[2] * x + mat[6] * y + mat[10] * z + mat[14] * w;
    dest[3] = mat[3] * x + mat[7] * y + mat[11] * z + mat[15] * w;

    return dest;
};

/**
 * Translates a matrix by the given vector
 *
 * @param {mat4} mat mat4 to translate
 * @param {vec3} vec vec3 specifying the translation
 * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to mat
 *
 * @returns {mat4} dest if specified, mat otherwise
 */
mat4.translate = function (mat, vec, dest) {
    var x = vec[0], y = vec[1], z = vec[2],
        a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23;

    if (!dest || mat === dest) {
        mat[12] = mat[0] * x + mat[4] * y + mat[8] * z + mat[12];
        mat[13] = mat[1] * x + mat[5] * y + mat[9] * z + mat[13];
        mat[14] = mat[2] * x + mat[6] * y + mat[10] * z + mat[14];
        mat[15] = mat[3] * x + mat[7] * y + mat[11] * z + mat[15];
        return mat;
    }

    a00 = mat[0]; a01 = mat[1]; a02 = mat[2]; a03 = mat[3];
    a10 = mat[4]; a11 = mat[5]; a12 = mat[6]; a13 = mat[7];
    a20 = mat[8]; a21 = mat[9]; a22 = mat[10]; a23 = mat[11];

    dest[0] = a00; dest[1] = a01; dest[2] = a02; dest[3] = a03;
    dest[4] = a10; dest[5] = a11; dest[6] = a12; dest[7] = a13;
    dest[8] = a20; dest[9] = a21; dest[10] = a22; dest[11] = a23;

    dest[12] = a00 * x + a10 * y + a20 * z + mat[12];
    dest[13] = a01 * x + a11 * y + a21 * z + mat[13];
    dest[14] = a02 * x + a12 * y + a22 * z + mat[14];
    dest[15] = a03 * x + a13 * y + a23 * z + mat[15];
    return dest;
};

/**
 * Scales a matrix by the given vector
 *
 * @param {mat4} mat mat4 to scale
 * @param {vec3} vec vec3 specifying the scale for each axis
 * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to mat
 *
 * @param {mat4} dest if specified, mat otherwise
 */
mat4.scale = function (mat, vec, dest) {
    var x = vec[0], y = vec[1], z = vec[2];

    if (!dest || mat === dest) {
        mat[0] *= x;
        mat[1] *= x;
        mat[2] *= x;
        mat[3] *= x;
        mat[4] *= y;
        mat[5] *= y;
        mat[6] *= y;
        mat[7] *= y;
        mat[8] *= z;
        mat[9] *= z;
        mat[10] *= z;
        mat[11] *= z;
        return mat;
    }

    dest[0] = mat[0] * x;
    dest[1] = mat[1] * x;
    dest[2] = mat[2] * x;
    dest[3] = mat[3] * x;
    dest[4] = mat[4] * y;
    dest[5] = mat[5] * y;
    dest[6] = mat[6] * y;
    dest[7] = mat[7] * y;
    dest[8] = mat[8] * z;
    dest[9] = mat[9] * z;
    dest[10] = mat[10] * z;
    dest[11] = mat[11] * z;
    dest[12] = mat[12];
    dest[13] = mat[13];
    dest[14] = mat[14];
    dest[15] = mat[15];
    return dest;
};

/**
 * Rotates a matrix by the given angle around the specified axis
 * If rotating around a primary axis (X,Y,Z) one of the specialized rotation functions should be used instead for performance
 *
 * @param {mat4} mat mat4 to rotate
 * @param {number} angle Angle (in radians) to rotate
 * @param {vec3} axis vec3 representing the axis to rotate around
 * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to mat
 *
 * @returns {mat4} dest if specified, mat otherwise
 */
mat4.rotate = function (mat, angle, axis, dest) {
    var x = axis[0], y = axis[1], z = axis[2],
        len = Math.sqrt(x * x + y * y + z * z),
        s, c, t,
        a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23,
        b00, b01, b02,
        b10, b11, b12,
        b20, b21, b22;

    if (!len) { return null; }
    if (len !== 1) {
        len = 1 / len;
        x *= len;
        y *= len;
        z *= len;
    }

    s = Math.sin(angle);
    c = Math.cos(angle);
    t = 1 - c;

    a00 = mat[0]; a01 = mat[1]; a02 = mat[2]; a03 = mat[3];
    a10 = mat[4]; a11 = mat[5]; a12 = mat[6]; a13 = mat[7];
    a20 = mat[8]; a21 = mat[9]; a22 = mat[10]; a23 = mat[11];

    // Construct the elements of the rotation matrix
    b00 = x * x * t + c; b01 = y * x * t + z * s; b02 = z * x * t - y * s;
    b10 = x * y * t - z * s; b11 = y * y * t + c; b12 = z * y * t + x * s;
    b20 = x * z * t + y * s; b21 = y * z * t - x * s; b22 = z * z * t + c;

    if (!dest) {
        dest = mat;
    } else if (mat !== dest) { // If the source and destination differ, copy the unchanged last row
        dest[12] = mat[12];
        dest[13] = mat[13];
        dest[14] = mat[14];
        dest[15] = mat[15];
    }

    // Perform rotation-specific matrix multiplication
    dest[0] = a00 * b00 + a10 * b01 + a20 * b02;
    dest[1] = a01 * b00 + a11 * b01 + a21 * b02;
    dest[2] = a02 * b00 + a12 * b01 + a22 * b02;
    dest[3] = a03 * b00 + a13 * b01 + a23 * b02;

    dest[4] = a00 * b10 + a10 * b11 + a20 * b12;
    dest[5] = a01 * b10 + a11 * b11 + a21 * b12;
    dest[6] = a02 * b10 + a12 * b11 + a22 * b12;
    dest[7] = a03 * b10 + a13 * b11 + a23 * b12;

    dest[8] = a00 * b20 + a10 * b21 + a20 * b22;
    dest[9] = a01 * b20 + a11 * b21 + a21 * b22;
    dest[10] = a02 * b20 + a12 * b21 + a22 * b22;
    dest[11] = a03 * b20 + a13 * b21 + a23 * b22;
    return dest;
};

/**
 * Rotates a matrix by the given angle around the X axis
 *
 * @param {mat4} mat mat4 to rotate
 * @param {number} angle Angle (in radians) to rotate
 * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to mat
 *
 * @returns {mat4} dest if specified, mat otherwise
 */
mat4.rotateX = function (mat, angle, dest) {
    var s = Math.sin(angle),
        c = Math.cos(angle),
        a10 = mat[4],
        a11 = mat[5],
        a12 = mat[6],
        a13 = mat[7],
        a20 = mat[8],
        a21 = mat[9],
        a22 = mat[10],
        a23 = mat[11];

    if (!dest) {
        dest = mat;
    } else if (mat !== dest) { // If the source and destination differ, copy the unchanged rows
        dest[0] = mat[0];
        dest[1] = mat[1];
        dest[2] = mat[2];
        dest[3] = mat[3];

        dest[12] = mat[12];
        dest[13] = mat[13];
        dest[14] = mat[14];
        dest[15] = mat[15];
    }

    // Perform axis-specific matrix multiplication
    dest[4] = a10 * c + a20 * s;
    dest[5] = a11 * c + a21 * s;
    dest[6] = a12 * c + a22 * s;
    dest[7] = a13 * c + a23 * s;

    dest[8] = a10 * -s + a20 * c;
    dest[9] = a11 * -s + a21 * c;
    dest[10] = a12 * -s + a22 * c;
    dest[11] = a13 * -s + a23 * c;
    return dest;
};

/**
 * Rotates a matrix by the given angle around the Y axis
 *
 * @param {mat4} mat mat4 to rotate
 * @param {number} angle Angle (in radians) to rotate
 * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to mat
 *
 * @returns {mat4} dest if specified, mat otherwise
 */
mat4.rotateY = function (mat, angle, dest) {
    var s = Math.sin(angle),
        c = Math.cos(angle),
        a00 = mat[0],
        a01 = mat[1],
        a02 = mat[2],
        a03 = mat[3],
        a20 = mat[8],
        a21 = mat[9],
        a22 = mat[10],
        a23 = mat[11];

    if (!dest) {
        dest = mat;
    } else if (mat !== dest) { // If the source and destination differ, copy the unchanged rows
        dest[4] = mat[4];
        dest[5] = mat[5];
        dest[6] = mat[6];
        dest[7] = mat[7];

        dest[12] = mat[12];
        dest[13] = mat[13];
        dest[14] = mat[14];
        dest[15] = mat[15];
    }

    // Perform axis-specific matrix multiplication
    dest[0] = a00 * c + a20 * -s;
    dest[1] = a01 * c + a21 * -s;
    dest[2] = a02 * c + a22 * -s;
    dest[3] = a03 * c + a23 * -s;

    dest[8] = a00 * s + a20 * c;
    dest[9] = a01 * s + a21 * c;
    dest[10] = a02 * s + a22 * c;
    dest[11] = a03 * s + a23 * c;
    return dest;
};

/**
 * Rotates a matrix by the given angle around the Z axis
 *
 * @param {mat4} mat mat4 to rotate
 * @param {number} angle Angle (in radians) to rotate
 * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to mat
 *
 * @returns {mat4} dest if specified, mat otherwise
 */
mat4.rotateZ = function (mat, angle, dest) {
    var s = Math.sin(angle),
        c = Math.cos(angle),
        a00 = mat[0],
        a01 = mat[1],
        a02 = mat[2],
        a03 = mat[3],
        a10 = mat[4],
        a11 = mat[5],
        a12 = mat[6],
        a13 = mat[7];

    if (!dest) {
        dest = mat;
    } else if (mat !== dest) { // If the source and destination differ, copy the unchanged last row
        dest[8] = mat[8];
        dest[9] = mat[9];
        dest[10] = mat[10];
        dest[11] = mat[11];

        dest[12] = mat[12];
        dest[13] = mat[13];
        dest[14] = mat[14];
        dest[15] = mat[15];
    }

    // Perform axis-specific matrix multiplication
    dest[0] = a00 * c + a10 * s;
    dest[1] = a01 * c + a11 * s;
    dest[2] = a02 * c + a12 * s;
    dest[3] = a03 * c + a13 * s;

    dest[4] = a00 * -s + a10 * c;
    dest[5] = a01 * -s + a11 * c;
    dest[6] = a02 * -s + a12 * c;
    dest[7] = a03 * -s + a13 * c;

    return dest;
};

/**
 * Generates a frustum matrix with the given bounds
 *
 * @param {number} left Left bound of the frustum
 * @param {number} right Right bound of the frustum
 * @param {number} bottom Bottom bound of the frustum
 * @param {number} top Top bound of the frustum
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @param {mat4} [dest] mat4 frustum matrix will be written into
 *
 * @returns {mat4} dest if specified, a new mat4 otherwise
 */
mat4.frustum = function (left, right, bottom, top, near, far, dest) {
    if (!dest) { dest = mat4.create(); }
    var rl = (right - left),
        tb = (top - bottom),
        fn = (far - near);
    dest[0] = (near * 2) / rl;
    dest[1] = 0;
    dest[2] = 0;
    dest[3] = 0;
    dest[4] = 0;
    dest[5] = (near * 2) / tb;
    dest[6] = 0;
    dest[7] = 0;
    dest[8] = (right + left) / rl;
    dest[9] = (top + bottom) / tb;
    dest[10] = -(far + near) / fn;
    dest[11] = -1;
    dest[12] = 0;
    dest[13] = 0;
    dest[14] = -(far * near * 2) / fn;
    dest[15] = 0;
    return dest;
};

/**
 * Generates a perspective projection matrix with the given bounds
 *
 * @param {number} fovy Vertical field of view
 * @param {number} aspect Aspect ratio. typically viewport width/height
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @param {mat4} [dest] mat4 frustum matrix will be written into
 *
 * @returns {mat4} dest if specified, a new mat4 otherwise
 */
mat4.perspective = function (fovy, aspect, near, far, dest) {
    var top = near * Math.tan(fovy * Math.PI / 360.0),
        right = top * aspect;
    return mat4.frustum(-right, right, -top, top, near, far, dest);
};

/**
 * Generates a orthogonal projection matrix with the given bounds
 *
 * @param {number} left Left bound of the frustum
 * @param {number} right Right bound of the frustum
 * @param {number} bottom Bottom bound of the frustum
 * @param {number} top Top bound of the frustum
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @param {mat4} [dest] mat4 frustum matrix will be written into
 *
 * @returns {mat4} dest if specified, a new mat4 otherwise
 */
mat4.ortho = function (left, right, bottom, top, near, far, dest) {
    if (!dest) { dest = mat4.create(); }
    var rl = (right - left),
        tb = (top - bottom),
        fn = (far - near);
    dest[0] = 2 / rl;
    dest[1] = 0;
    dest[2] = 0;
    dest[3] = 0;
    dest[4] = 0;
    dest[5] = 2 / tb;
    dest[6] = 0;
    dest[7] = 0;
    dest[8] = 0;
    dest[9] = 0;
    dest[10] = -2 / fn;
    dest[11] = 0;
    dest[12] = -(left + right) / rl;
    dest[13] = -(top + bottom) / tb;
    dest[14] = -(far + near) / fn;
    dest[15] = 1;
    return dest;
};

/**
 * Generates a look-at matrix with the given eye position, focal point, and up axis
 *
 * @param {vec3} eye Position of the viewer
 * @param {vec3} center Point the viewer is looking at
 * @param {vec3} up vec3 pointing "up"
 * @param {mat4} [dest] mat4 frustum matrix will be written into
 *
 * @returns {mat4} dest if specified, a new mat4 otherwise
 */
mat4.lookAt = function (eye, center, up, dest) {
    if (!dest) { dest = mat4.create(); }

    var x0, x1, x2, y0, y1, y2, z0, z1, z2, len,
        eyex = eye[0],
        eyey = eye[1],
        eyez = eye[2],
        upx = up[0],
        upy = up[1],
        upz = up[2],
        centerx = center[0],
        centery = center[1],
        centerz = center[2];

    if (eyex === centerx && eyey === centery && eyez === centerz) {
        return mat4.identity(dest);
    }

    //vec3.direction(eye, center, z);
    z0 = eyex - centerx;
    z1 = eyey - centery;
    z2 = eyez - centerz;

    // normalize (no check needed for 0 because of early return)
    len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= len;
    z1 *= len;
    z2 *= len;

    //vec3.normalize(vec3.cross(up, z, x));
    x0 = upy * z2 - upz * z1;
    x1 = upz * z0 - upx * z2;
    x2 = upx * z1 - upy * z0;
    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    if (!len) {
        x0 = 0;
        x1 = 0;
        x2 = 0;
    } else {
        len = 1 / len;
        x0 *= len;
        x1 *= len;
        x2 *= len;
    }

    //vec3.normalize(vec3.cross(z, x, y));
    y0 = z1 * x2 - z2 * x1;
    y1 = z2 * x0 - z0 * x2;
    y2 = z0 * x1 - z1 * x0;

    len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
    if (!len) {
        y0 = 0;
        y1 = 0;
        y2 = 0;
    } else {
        len = 1 / len;
        y0 *= len;
        y1 *= len;
        y2 *= len;
    }

    dest[0] = x0;
    dest[1] = y0;
    dest[2] = z0;
    dest[3] = 0;
    dest[4] = x1;
    dest[5] = y1;
    dest[6] = z1;
    dest[7] = 0;
    dest[8] = x2;
    dest[9] = y2;
    dest[10] = z2;
    dest[11] = 0;
    dest[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
    dest[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
    dest[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
    dest[15] = 1;

    return dest;
};

/**
 * Creates a matrix from a quaternion rotation and vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     var quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *
 * @param {quat4} quat Rotation quaternion
 * @param {vec3} vec Translation vector
 * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to a new mat4
 *
 * @returns {mat4} dest if specified, a new mat4 otherwise
 */
mat4.fromRotationTranslation = function (quat, vec, dest) {
    if (!dest) { dest = mat4.create(); }

    // Quaternion math
    var x = quat[0], y = quat[1], z = quat[2], w = quat[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    dest[0] = 1 - (yy + zz);
    dest[1] = xy + wz;
    dest[2] = xz - wy;
    dest[3] = 0;
    dest[4] = xy - wz;
    dest[5] = 1 - (xx + zz);
    dest[6] = yz + wx;
    dest[7] = 0;
    dest[8] = xz + wy;
    dest[9] = yz - wx;
    dest[10] = 1 - (xx + yy);
    dest[11] = 0;
    dest[12] = vec[0];
    dest[13] = vec[1];
    dest[14] = vec[2];
    dest[15] = 1;

    return dest;
};

/**
 * Returns a string representation of a mat4
 *
 * @param {mat4} mat mat4 to represent as a string
 *
 * @returns {string} String representation of mat
 */
mat4.str = function (mat) {
    return '[' + mat[0] + ', ' + mat[1] + ', ' + mat[2] + ', ' + mat[3] +
        ', ' + mat[4] + ', ' + mat[5] + ', ' + mat[6] + ', ' + mat[7] +
        ', ' + mat[8] + ', ' + mat[9] + ', ' + mat[10] + ', ' + mat[11] +
        ', ' + mat[12] + ', ' + mat[13] + ', ' + mat[14] + ', ' + mat[15] + ']';
};

/*
 * quat4
 */

/**
 * Creates a new instance of a quat4 using the default array type
 * Any javascript array containing at least 4 numeric elements can serve as a quat4
 *
 * @param {quat4} [quat] quat4 containing values to initialize with
 *
 * @returns {quat4} New quat4
 */
quat4.create = function (quat) {
    var dest = new MatrixArray(4);

    if (quat) {
        dest[0] = quat[0];
        dest[1] = quat[1];
        dest[2] = quat[2];
        dest[3] = quat[3];
    }

    return dest;
};

/**
 * Copies the values of one quat4 to another
 *
 * @param {quat4} quat quat4 containing values to copy
 * @param {quat4} dest quat4 receiving copied values
 *
 * @returns {quat4} dest
 */
quat4.set = function (quat, dest) {
    dest[0] = quat[0];
    dest[1] = quat[1];
    dest[2] = quat[2];
    dest[3] = quat[3];

    return dest;
};

/**
 * Calculates the W component of a quat4 from the X, Y, and Z components.
 * Assumes that quaternion is 1 unit in length.
 * Any existing W component will be ignored.
 *
 * @param {quat4} quat quat4 to calculate W component of
 * @param {quat4} [dest] quat4 receiving calculated values. If not specified result is written to quat
 *
 * @returns {quat4} dest if specified, quat otherwise
 */
quat4.calculateW = function (quat, dest) {
    var x = quat[0], y = quat[1], z = quat[2];

    if (!dest || quat === dest) {
        quat[3] = -Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
        return quat;
    }
    dest[0] = x;
    dest[1] = y;
    dest[2] = z;
    dest[3] = -Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
    return dest;
};

/**
 * Calculates the dot product of two quaternions
 *
 * @param {quat4} quat First operand
 * @param {quat4} quat2 Second operand
 *
 * @return {number} Dot product of quat and quat2
 */
quat4.dot = function(quat, quat2){
    return quat[0]*quat2[0] + quat[1]*quat2[1] + quat[2]*quat2[2] + quat[3]*quat2[3];
};

/**
 * Calculates the inverse of a quat4
 *
 * @param {quat4} quat quat4 to calculate inverse of
 * @param {quat4} [dest] quat4 receiving inverse values. If not specified result is written to quat
 *
 * @returns {quat4} dest if specified, quat otherwise
 */
quat4.inverse = function(quat, dest) {
    var q0 = quat[0], q1 = quat[1], q2 = quat[2], q3 = quat[3],
        dot = q0*q0 + q1*q1 + q2*q2 + q3*q3,
        invDot = dot ? 1.0/dot : 0;

    // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0

    if(!dest || quat === dest) {
        quat[0] *= -invDot;
        quat[1] *= -invDot;
        quat[2] *= -invDot;
        quat[3] *= invDot;
        return quat;
    }
    dest[0] = -quat[0]*invDot;
    dest[1] = -quat[1]*invDot;
    dest[2] = -quat[2]*invDot;
    dest[3] = quat[3]*invDot;
    return dest;
};


/**
 * Calculates the conjugate of a quat4
 * If the quaternion is normalized, this function is faster than quat4.inverse and produces the same result.
 *
 * @param {quat4} quat quat4 to calculate conjugate of
 * @param {quat4} [dest] quat4 receiving conjugate values. If not specified result is written to quat
 *
 * @returns {quat4} dest if specified, quat otherwise
 */
quat4.conjugate = function (quat, dest) {
    if (!dest || quat === dest) {
        quat[0] *= -1;
        quat[1] *= -1;
        quat[2] *= -1;
        return quat;
    }
    dest[0] = -quat[0];
    dest[1] = -quat[1];
    dest[2] = -quat[2];
    dest[3] = quat[3];
    return dest;
};

/**
 * Calculates the length of a quat4
 *
 * Params:
 * @param {quat4} quat quat4 to calculate length of
 *
 * @returns Length of quat
 */
quat4.length = function (quat) {
    var x = quat[0], y = quat[1], z = quat[2], w = quat[3];
    return Math.sqrt(x * x + y * y + z * z + w * w);
};

/**
 * Generates a unit quaternion of the same direction as the provided quat4
 * If quaternion length is 0, returns [0, 0, 0, 0]
 *
 * @param {quat4} quat quat4 to normalize
 * @param {quat4} [dest] quat4 receiving operation result. If not specified result is written to quat
 *
 * @returns {quat4} dest if specified, quat otherwise
 */
quat4.normalize = function (quat, dest) {
    if (!dest) { dest = quat; }

    var x = quat[0], y = quat[1], z = quat[2], w = quat[3],
        len = Math.sqrt(x * x + y * y + z * z + w * w);
    if (len === 0) {
        dest[0] = 0;
        dest[1] = 0;
        dest[2] = 0;
        dest[3] = 0;
        return dest;
    }
    len = 1 / len;
    dest[0] = x * len;
    dest[1] = y * len;
    dest[2] = z * len;
    dest[3] = w * len;

    return dest;
};

/**
 * Performs a quaternion multiplication
 *
 * @param {quat4} quat First operand
 * @param {quat4} quat2 Second operand
 * @param {quat4} [dest] quat4 receiving operation result. If not specified result is written to quat
 *
 * @returns {quat4} dest if specified, quat otherwise
 */
quat4.multiply = function (quat, quat2, dest) {
    if (!dest) { dest = quat; }

    var qax = quat[0], qay = quat[1], qaz = quat[2], qaw = quat[3],
        qbx = quat2[0], qby = quat2[1], qbz = quat2[2], qbw = quat2[3];

    dest[0] = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
    dest[1] = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
    dest[2] = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
    dest[3] = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

    return dest;
};

/**
 * Transforms a vec3 with the given quaternion
 *
 * @param {quat4} quat quat4 to transform the vector with
 * @param {vec3} vec vec3 to transform
 * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
 *
 * @returns dest if specified, vec otherwise
 */
quat4.multiplyVec3 = function (quat, vec, dest) {
    if (!dest) { dest = vec; }

    var x = vec[0], y = vec[1], z = vec[2],
        qx = quat[0], qy = quat[1], qz = quat[2], qw = quat[3],

    // calculate quat * vec
        ix = qw * x + qy * z - qz * y,
        iy = qw * y + qz * x - qx * z,
        iz = qw * z + qx * y - qy * x,
        iw = -qx * x - qy * y - qz * z;

    // calculate result * inverse quat
    dest[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    dest[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    dest[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;

    return dest;
};

/**
 * Calculates a 3x3 matrix from the given quat4
 *
 * @param {quat4} quat quat4 to create matrix from
 * @param {mat3} [dest] mat3 receiving operation result
 *
 * @returns {mat3} dest if specified, a new mat3 otherwise
 */
quat4.toMat3 = function (quat, dest) {
    if (!dest) { dest = mat3.create(); }

    var x = quat[0], y = quat[1], z = quat[2], w = quat[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    dest[0] = 1 - (yy + zz);
    dest[1] = xy + wz;
    dest[2] = xz - wy;

    dest[3] = xy - wz;
    dest[4] = 1 - (xx + zz);
    dest[5] = yz + wx;

    dest[6] = xz + wy;
    dest[7] = yz - wx;
    dest[8] = 1 - (xx + yy);

    return dest;
};

/**
 * Calculates a 4x4 matrix from the given quat4
 *
 * @param {quat4} quat quat4 to create matrix from
 * @param {mat4} [dest] mat4 receiving operation result
 *
 * @returns {mat4} dest if specified, a new mat4 otherwise
 */
quat4.toMat4 = function (quat, dest) {
    if (!dest) { dest = mat4.create(); }

    var x = quat[0], y = quat[1], z = quat[2], w = quat[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    dest[0] = 1 - (yy + zz);
    dest[1] = xy + wz;
    dest[2] = xz - wy;
    dest[3] = 0;

    dest[4] = xy - wz;
    dest[5] = 1 - (xx + zz);
    dest[6] = yz + wx;
    dest[7] = 0;

    dest[8] = xz + wy;
    dest[9] = yz - wx;
    dest[10] = 1 - (xx + yy);
    dest[11] = 0;

    dest[12] = 0;
    dest[13] = 0;
    dest[14] = 0;
    dest[15] = 1;

    return dest;
};

/**
 * Performs a spherical linear interpolation between two quat4
 *
 * @param {quat4} quat First quaternion
 * @param {quat4} quat2 Second quaternion
 * @param {number} slerp Interpolation amount between the two inputs
 * @param {quat4} [dest] quat4 receiving operation result. If not specified result is written to quat
 *
 * @returns {quat4} dest if specified, quat otherwise
 */
quat4.slerp = function (quat, quat2, slerp, dest) {
    if (!dest) { dest = quat; }

    var cosHalfTheta = quat[0] * quat2[0] + quat[1] * quat2[1] + quat[2] * quat2[2] + quat[3] * quat2[3],
        halfTheta,
        sinHalfTheta,
        ratioA,
        ratioB;

    if (Math.abs(cosHalfTheta) >= 1.0) {
        if (dest !== quat) {
            dest[0] = quat[0];
            dest[1] = quat[1];
            dest[2] = quat[2];
            dest[3] = quat[3];
        }
        return dest;
    }

    halfTheta = Math.acos(cosHalfTheta);
    sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);

    if (Math.abs(sinHalfTheta) < 0.001) {
        dest[0] = (quat[0] * 0.5 + quat2[0] * 0.5);
        dest[1] = (quat[1] * 0.5 + quat2[1] * 0.5);
        dest[2] = (quat[2] * 0.5 + quat2[2] * 0.5);
        dest[3] = (quat[3] * 0.5 + quat2[3] * 0.5);
        return dest;
    }

    ratioA = Math.sin((1 - slerp) * halfTheta) / sinHalfTheta;
    ratioB = Math.sin(slerp * halfTheta) / sinHalfTheta;

    dest[0] = (quat[0] * ratioA + quat2[0] * ratioB);
    dest[1] = (quat[1] * ratioA + quat2[1] * ratioB);
    dest[2] = (quat[2] * ratioA + quat2[2] * ratioB);
    dest[3] = (quat[3] * ratioA + quat2[3] * ratioB);

    return dest;
};

/**
 * Returns a string representation of a quaternion
 *
 * @param {quat4} quat quat4 to represent as a string
 *
 * @returns {string} String representation of quat
 */
quat4.str = function (quat) {
    return '[' + quat[0] + ', ' + quat[1] + ', ' + quat[2] + ', ' + quat[3] + ']';
};

/**
 * Created with JetBrains PhpStorm.
 * User: fridek
 * Date: 28.03.12
 * Time: 23:35
 * To change this template use File | Settings | File Templates.
 */

goog.provide('Rendering.Programs_Interface');

/**
 * Program is a set of compiled shaders
 * @interface
 */
Rendering.Programs_Interface = function() {};

Rendering.Programs_Interface.prototype.draw = function() {};
/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 10.03.12
 * Time: 13:18
 * To change this template use File | Settings | File Templates.
 */
goog.require("Rendering.Programs_Interface");
goog.provide("Rendering.Programs_Texture");

/**
 * @constructor
 * @implements {Rendering.Programs_Interface}
 * @param {WebGLRenderingContext}
*/
Rendering.Programs_Texture = function(gl) {
    var vshader = gl.createShader(goog.webgl.VERTEX_SHADER);
    gl.shaderSource(vshader,[
        'attribute vec3 vertexPosition;',
        'attribute vec3 vertexNormal;',
        'attribute vec2 vertexTextureCoords;',

        'varying mediump vec2 texture_coordinates;',

        'uniform mat4 MVMatrix;',

        'void main(void)',
        '{',
            'texture_coordinates = vertexTextureCoords;',
            'gl_Position = MVMatrix * vec4(vertexPosition, 1.0);',
        '}'].join("\n")
    );
    gl.compileShader(vshader);
    if (!gl.getShaderParameter(vshader, goog.webgl.COMPILE_STATUS)) {
        alert('Error during vertex shader compilation:\n' + gl.getShaderInfoLog(vshader)); return;
    }


    var fshader = gl.createShader(goog.webgl.FRAGMENT_SHADER);
    gl.shaderSource(fshader, [
        'varying mediump vec2 texture_coordinates;',
        'uniform sampler2D texture_unit;',

        'void main(void)',
        '{',
            'gl_FragColor = texture2D(texture_unit, vec2(texture_coordinates.s, texture_coordinates.t));',
        '}'].join("\n"));
    gl.compileShader(fshader);
    if (!gl.getShaderParameter(fshader, goog.webgl.COMPILE_STATUS)) {
        alert('Error during vertex shader compilation:\n' + gl.getShaderInfoLog(fshader)); return;
    }

    var program = gl.createProgram();
    gl.attachShader(program, fshader);
    gl.attachShader(program, vshader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, goog.webgl.LINK_STATUS)){
        alert("Error during program linking:\n" + gl.getProgramInfoLog(program));
        return;
    }

    // Validates and uses program in the GL context
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, goog.webgl.VALIDATE_STATUS)) {
        alert("Error during program validation:\n" + gl.getProgramInfoLog(program));
        return;
    }
    /**
     * @type {WebGLProgram}
     */
    this.program = program;
    /**
     * @type {Object.<WebGLUniformLocation>}
     */
    this.uniforms=  {
            MVMatrix: gl.getUniformLocation(program, "MVMatrix"),
            texture_unit: gl.getUniformLocation(program, "texture_unit")
        };
    /**
     * @type {Object.<number>}
     */
    this.attribs = {
            vertexPosition: gl.getAttribLocation(program, 'vertexPosition'),
            vertexNormal: gl.getAttribLocation(program, 'vertexNormal'),
            vertexTextureCoords: gl.getAttribLocation(program, 'vertexTextureCoords')
        };
    gl.enableVertexAttribArray(this.attribs.vertexPosition);
    gl.enableVertexAttribArray(this.attribs.vertexNormal);
    gl.enableVertexAttribArray(this.attribs.vertexTextureCoords);
};
/**
 * @param {WebGLRenderingContext}
 * @param {Rendering.Model}
 */
Rendering.Programs_Texture.prototype.draw = function(gl, model) {
    gl.bindBuffer(goog.webgl.ARRAY_BUFFER, model.verticesBuffer);
    gl.vertexAttribPointer(this.attribs.vertexPosition, 3, goog.webgl.FLOAT, false, 0, 0);
    gl.bindBuffer(goog.webgl.ARRAY_BUFFER, model.normalsBuffer);
    gl.vertexAttribPointer(this.attribs.vertexNormal, 3, goog.webgl.FLOAT, false, 0, 0);
    gl.bindBuffer(goog.webgl.ARRAY_BUFFER, model.uvsBuffer);
    gl.vertexAttribPointer(this.attribs.vertexTextureCoords, 2, goog.webgl.FLOAT, false, 0, 0);

    gl.activeTexture(goog.webgl.TEXTURE0);
    gl.bindTexture(goog.webgl.TEXTURE_2D, model.texture);
    gl.uniform1i(this.uniforms.texture_unit, 0);

    gl.drawArrays(model.verticesType, 0, model.verticesBufferSize);
};/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 10.03.12
 * Time: 13:18
 * To change this template use File | Settings | File Templates.
 */

goog.require("Rendering.Programs_Interface");
goog.provide("Rendering.Programs_Normal2ColorCameraPosition");

/**
 * @constructor
 * @implements {Rendering.Programs_Interface}
 * @param {WebGLRenderingContext}
 */
Rendering.Programs_Normal2ColorCameraPosition = function(gl) {
    var vshader = gl.createShader(goog.webgl.VERTEX_SHADER);
    gl.shaderSource(vshader,[
        'attribute vec3 aVertexPosition;',
        'attribute vec3 normalPosition;',

        'varying mediump vec4 vVaryingColor;',
        'uniform mat4 viewMatrix;',
        'uniform mat4 projectionMatrix;',
        'uniform mat4 modelMatrix;',

        'void main(void)',
        '{',
            'vVaryingColor = vec4(normalPosition, 1.0);',
            'gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(aVertexPosition, 1.0);',
        '}'].join("\n")
    );
    gl.compileShader(vshader);
    if (!gl.getShaderParameter(vshader, goog.webgl.COMPILE_STATUS)) {
        alert('Error during vertex shader compilation:\n' + gl.getShaderInfoLog(vshader)); return;
    }


    var fshader = gl.createShader(goog.webgl.FRAGMENT_SHADER);
    gl.shaderSource(fshader, [
        'varying mediump vec4 vVaryingColor;',
        'void main(void)',
        '{',
            'gl_FragColor = vVaryingColor;',
        '}'].join("\n"));
    gl.compileShader(fshader);
    if (!gl.getShaderParameter(fshader, goog.webgl.COMPILE_STATUS)) {
        alert('Error during vertex shader compilation:\n' + gl.getShaderInfoLog(fshader)); return;
    }

    var program = gl.createProgram();
    gl.attachShader(program, fshader);
    gl.attachShader(program, vshader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, goog.webgl.LINK_STATUS)){
        alert("Error during program linking:\n" + gl.getProgramInfoLog(program));
        return;
    }

    // Validates and uses program in the GL context
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, goog.webgl.VALIDATE_STATUS)) {
        alert("Error during program validation:\n" + gl.getProgramInfoLog(program));
        return;
    }
    /**
     * @type {WebGLProgram}
     */
    this.program = program;
    /**
     * @type {Object.<WebGLUniformLocation>}
     */
    this.uniforms=  {
            modelMatrix: gl.getUniformLocation(program, "modelMatrix"),
            viewMatrix: gl.getUniformLocation(program, "viewMatrix"),
            projectionMatrix: gl.getUniformLocation(program, "projectionMatrix")
        };
    /**
     * @type {Object.<number>}
     */
    this.attribs = {
            vertexPosition: gl.getAttribLocation(program, 'aVertexPosition'),
            normalPosition: gl.getAttribLocation(program, 'normalPosition')
        };
    gl.enableVertexAttribArray(this.attribs.vertexPosition);
    gl.enableVertexAttribArray(this.attribs.normalPosition);
};
/**
 * @param {WebGLRenderingContext}
 * @param {Rendering.Model}
 */
Rendering.Programs_Normal2ColorCameraPosition.prototype.draw = function(gl, model) {
    gl.bindBuffer(goog.webgl.ARRAY_BUFFER, model.verticesBuffer);
    gl.vertexAttribPointer(this.attribs.vertexPosition, 3, goog.webgl.FLOAT, false, 0, 0);
    gl.bindBuffer(goog.webgl.ARRAY_BUFFER, model.normalsBuffer);
    gl.vertexAttribPointer(this.attribs.normalPosition, 3, goog.webgl.FLOAT, false, 0, 0);
    gl.drawArrays(model.verticesType, 0, model.verticesBufferSize);
};/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 10.03.12
 * Time: 00:27
 * To change this template use File | Settings | File Templates.
 */

goog.require('vec3');

goog.provide("Rendering.Model");

/**
 *
 * @constructor
 */
Rendering.Model = function() {
    /**
     * @type {number}
     */
    this.verticesType = goog.webgl.TRIANGLES;

    /**
     * @type {number}
     */
    this.verticesIndexingType = goog.webgl.ARRAY_BUFFER;

    /**
     * @type {vec3}
     */
    this.position = vec3.create([0,0,0]);
};

/**
 * @param {Rendering.Model} model
 */
Rendering.Model.prototype.createInstance = function(model) {
    /**
     * @type {number}
     */
    this.verticesType = model.verticesType;
    /**
     * @type {number}
     */
    this.verticesIndexingType = model.verticesIndexingType;
    /**
     * @type {WebGLBuffer}
     */
    this.verticesBuffer = model.verticesBuffer;
    /**
     *
     * @type {Number}
     */
    this.verticesBufferSize = model.verticesBufferSize;
    /**
     *
     * @type {WebGLBuffer}
     */
    this.normalsBuffer = model.normalsBuffer;
    /**
     *
     * @type {Number}
     */
    this.normalsBufferSize = model.normalsBufferSize;
    /**
     *
     * @type {WebGLBuffer}
     */
    this.uvsBuffer = model.uvsBuffer;
    /**
     *
     * @type {Number}
     */
    this.uvsBufferSize = model.uvsBufferSize;
    /**
     *
     * @type {WebGLTexture}
     */
    this.texture = model.texture;
    /**
     *
     * @type {Boolean}
     */
    this.textureLoaded = model.textureLoaded;
    /**
     *
     * @type {vec3}
     */
    this.position = model.position;
};

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {Float32Array} vertices
 */
Rendering.Model.prototype.createVerticesBuffer = function(gl, vertices) {
    /**
     * @type {WebGLBuffer}
     */
    this.verticesBuffer = gl.createBuffer();
    /**
     * @type {Number}
     */
    this.verticesBufferSize = vertices.length/3;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
};

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {Float32Array} normals
 */
Rendering.Model.prototype.createNormalsBuffer = function(gl, normals) {
    /**
     * @type {WebGLBuffer}
     */
    this.normalsBuffer = gl.createBuffer();
    /**
     * @type {Number}
     */
    this.normalsBufferSize = normals.length/3;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
};

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {Float32Array} uvs
 */
Rendering.Model.prototype.createUVsBuffer = function(gl, uvs) {
    /**
     * @type {WebGLBuffer}
     */
    this.uvsBuffer = gl.createBuffer();
    /**
     * @type {Number}
     */
    this.uvsBufferSize = uvs.length/2;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.uvsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
};

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {String} filename
 */
Rendering.Model.prototype.loadTexture = function(gl, filename) {
    /**
     * @type {Boolean}
     */
    this.textureLoaded = false;

    /**
     * @type {WebGLTexture}
     */
    this.texture = gl.createTexture();
    var img = new Image();
    var that = this;
    img.onload = function() {
        gl.bindTexture(gl.TEXTURE_2D, that.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
        that.textureLoaded = true;
    };
    img.src = filename;
};
/**
 * Created with JetBrains PhpStorm.
 * User: fridek
 * Date: 28.03.12
 * Time: 23:39
 * To change this template use File | Settings | File Templates.
 */

goog.provide('Rendering.Demos_Interface');

/**
 * Program is a set of compiled shaders
 * @interface
 */
Rendering.Demos_Interface = function() {};
/**
 * @param {WebGLRenderingContext}
 */
Rendering.Demos_Interface.prototype.run = function(gl) {};
Rendering.Demos_Interface.prototype.stop = function() {};
/**
 * @param {WebGLRenderingContext}
 */
Rendering.Demos_Interface.prototype.frame = function(gl) {};
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities for string manipulation.
 */


/**
 * Namespace for string utilities
 */
goog.provide('goog.string');
goog.provide('goog.string.Unicode');


/**
 * Common Unicode string characters.
 * @enum {string}
 */
goog.string.Unicode = {
  NBSP: '\xa0'
};


/**
 * Fast prefix-checker.
 * @param {string} str The string to check.
 * @param {string} prefix A string to look for at the start of {@code str}.
 * @return {boolean} True if {@code str} begins with {@code prefix}.
 */
goog.string.startsWith = function(str, prefix) {
  return str.lastIndexOf(prefix, 0) == 0;
};


/**
 * Fast suffix-checker.
 * @param {string} str The string to check.
 * @param {string} suffix A string to look for at the end of {@code str}.
 * @return {boolean} True if {@code str} ends with {@code suffix}.
 */
goog.string.endsWith = function(str, suffix) {
  var l = str.length - suffix.length;
  return l >= 0 && str.indexOf(suffix, l) == l;
};


/**
 * Case-insensitive prefix-checker.
 * @param {string} str The string to check.
 * @param {string} prefix  A string to look for at the end of {@code str}.
 * @return {boolean} True if {@code str} begins with {@code prefix} (ignoring
 *     case).
 */
goog.string.caseInsensitiveStartsWith = function(str, prefix) {
  return goog.string.caseInsensitiveCompare(
      prefix, str.substr(0, prefix.length)) == 0;
};


/**
 * Case-insensitive suffix-checker.
 * @param {string} str The string to check.
 * @param {string} suffix A string to look for at the end of {@code str}.
 * @return {boolean} True if {@code str} ends with {@code suffix} (ignoring
 *     case).
 */
goog.string.caseInsensitiveEndsWith = function(str, suffix) {
  return goog.string.caseInsensitiveCompare(
      suffix, str.substr(str.length - suffix.length, suffix.length)) == 0;
};


/**
 * Does simple python-style string substitution.
 * subs("foo%s hot%s", "bar", "dog") becomes "foobar hotdog".
 * @param {string} str The string containing the pattern.
 * @param {...*} var_args The items to substitute into the pattern.
 * @return {string} A copy of {@code str} in which each occurrence of
 *     {@code %s} has been replaced an argument from {@code var_args}.
 */
goog.string.subs = function(str, var_args) {
  // This appears to be slow, but testing shows it compares more or less
  // equivalent to the regex.exec method.
  for (var i = 1; i < arguments.length; i++) {
    // We cast to String in case an argument is a Function.  Replacing $&, for
    // example, with $$$& stops the replace from subsituting the whole match
    // into the resultant string.  $$$& in the first replace becomes $$& in the
    //  second, which leaves $& in the resultant string.  Also:
    // $$, $`, $', $n $nn
    var replacement = String(arguments[i]).replace(/\$/g, '$$$$');
    str = str.replace(/\%s/, replacement);
  }
  return str;
};


/**
 * Converts multiple whitespace chars (spaces, non-breaking-spaces, new lines
 * and tabs) to a single space, and strips leading and trailing whitespace.
 * @param {string} str Input string.
 * @return {string} A copy of {@code str} with collapsed whitespace.
 */
goog.string.collapseWhitespace = function(str) {
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return str.replace(/[\s\xa0]+/g, ' ').replace(/^\s+|\s+$/g, '');
};


/**
 * Checks if a string is empty or contains only whitespaces.
 * @param {string} str The string to check.
 * @return {boolean} True if {@code str} is empty or whitespace only.
 */
goog.string.isEmpty = function(str) {
  // testing length == 0 first is actually slower in all browsers (about the
  // same in Opera).
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return /^[\s\xa0]*$/.test(str);
};


/**
 * Checks if a string is null, empty or contains only whitespaces.
 * @param {*} str The string to check.
 * @return {boolean} True if{@code str} is null, empty, or whitespace only.
 */
goog.string.isEmptySafe = function(str) {
  return goog.string.isEmpty(goog.string.makeSafe(str));
};


/**
 * Checks if a string is all breaking whitespace.
 * @param {string} str The string to check.
 * @return {boolean} Whether the string is all breaking whitespace.
 */
goog.string.isBreakingWhitespace = function(str) {
  return !/[^\t\n\r ]/.test(str);
};


/**
 * Checks if a string contains all letters.
 * @param {string} str string to check.
 * @return {boolean} True if {@code str} consists entirely of letters.
 */
goog.string.isAlpha = function(str) {
  return !/[^a-zA-Z]/.test(str);
};


/**
 * Checks if a string contains only numbers.
 * @param {*} str string to check. If not a string, it will be
 *     casted to one.
 * @return {boolean} True if {@code str} is numeric.
 */
goog.string.isNumeric = function(str) {
  return !/[^0-9]/.test(str);
};


/**
 * Checks if a string contains only numbers or letters.
 * @param {string} str string to check.
 * @return {boolean} True if {@code str} is alphanumeric.
 */
goog.string.isAlphaNumeric = function(str) {
  return !/[^a-zA-Z0-9]/.test(str);
};


/**
 * Checks if a character is a space character.
 * @param {string} ch Character to check.
 * @return {boolean} True if {code ch} is a space.
 */
goog.string.isSpace = function(ch) {
  return ch == ' ';
};


/**
 * Checks if a character is a valid unicode character.
 * @param {string} ch Character to check.
 * @return {boolean} True if {code ch} is a valid unicode character.
 */
goog.string.isUnicodeChar = function(ch) {
  return ch.length == 1 && ch >= ' ' && ch <= '~' ||
         ch >= '\u0080' && ch <= '\uFFFD';
};


/**
 * Takes a string and replaces newlines with a space. Multiple lines are
 * replaced with a single space.
 * @param {string} str The string from which to strip newlines.
 * @return {string} A copy of {@code str} stripped of newlines.
 */
goog.string.stripNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)+/g, ' ');
};


/**
 * Replaces Windows and Mac new lines with unix style: \r or \r\n with \n.
 * @param {string} str The string to in which to canonicalize newlines.
 * @return {string} {@code str} A copy of {@code} with canonicalized newlines.
 */
goog.string.canonicalizeNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)/g, '\n');
};


/**
 * Normalizes whitespace in a string, replacing all whitespace chars with
 * a space.
 * @param {string} str The string in which to normalize whitespace.
 * @return {string} A copy of {@code str} with all whitespace normalized.
 */
goog.string.normalizeWhitespace = function(str) {
  return str.replace(/\xa0|\s/g, ' ');
};


/**
 * Normalizes spaces in a string, replacing all consecutive spaces and tabs
 * with a single space. Replaces non-breaking space with a space.
 * @param {string} str The string in which to normalize spaces.
 * @return {string} A copy of {@code str} with all consecutive spaces and tabs
 *    replaced with a single space.
 */
goog.string.normalizeSpaces = function(str) {
  return str.replace(/\xa0|[ \t]+/g, ' ');
};


/**
 * Removes the breaking spaces from the left and right of the string and
 * collapses the sequences of breaking spaces in the middle into single spaces.
 * The original and the result strings render the same way in HTML.
 * @param {string} str A string in which to collapse spaces.
 * @return {string} Copy of the string with normalized breaking spaces.
 */
goog.string.collapseBreakingSpaces = function(str) {
  return str.replace(/[\t\r\n ]+/g, ' ').replace(
      /^[\t\r\n ]+|[\t\r\n ]+$/g, '');
};


/**
 * Trims white spaces to the left and right of a string.
 * @param {string} str The string to trim.
 * @return {string} A trimmed copy of {@code str}.
 */
goog.string.trim = function(str) {
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return str.replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');
};


/**
 * Trims whitespaces at the left end of a string.
 * @param {string} str The string to left trim.
 * @return {string} A trimmed copy of {@code str}.
 */
goog.string.trimLeft = function(str) {
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return str.replace(/^[\s\xa0]+/, '');
};


/**
 * Trims whitespaces at the right end of a string.
 * @param {string} str The string to right trim.
 * @return {string} A trimmed copy of {@code str}.
 */
goog.string.trimRight = function(str) {
  // Since IE doesn't include non-breaking-space (0xa0) in their \s character
  // class (as required by section 7.2 of the ECMAScript spec), we explicitly
  // include it in the regexp to enforce consistent cross-browser behavior.
  return str.replace(/[\s\xa0]+$/, '');
};


/**
 * A string comparator that ignores case.
 * -1 = str1 less than str2
 *  0 = str1 equals str2
 *  1 = str1 greater than str2
 *
 * @param {string} str1 The string to compare.
 * @param {string} str2 The string to compare {@code str1} to.
 * @return {number} The comparator result, as described above.
 */
goog.string.caseInsensitiveCompare = function(str1, str2) {
  var test1 = String(str1).toLowerCase();
  var test2 = String(str2).toLowerCase();

  if (test1 < test2) {
    return -1;
  } else if (test1 == test2) {
    return 0;
  } else {
    return 1;
  }
};


/**
 * Regular expression used for splitting a string into substrings of fractional
 * numbers, integers, and non-numeric characters.
 * @type {RegExp}
 * @private
 */
goog.string.numerateCompareRegExp_ = /(\.\d+)|(\d+)|(\D+)/g;


/**
 * String comparison function that handles numbers in a way humans might expect.
 * Using this function, the string "File 2.jpg" sorts before "File 10.jpg". The
 * comparison is mostly case-insensitive, though strings that are identical
 * except for case are sorted with the upper-case strings before lower-case.
 *
 * This comparison function is significantly slower (about 500x) than either
 * the default or the case-insensitive compare. It should not be used in
 * time-critical code, but should be fast enough to sort several hundred short
 * strings (like filenames) with a reasonable delay.
 *
 * @param {string} str1 The string to compare in a numerically sensitive way.
 * @param {string} str2 The string to compare {@code str1} to.
 * @return {number} less than 0 if str1 < str2, 0 if str1 == str2, greater than
 *     0 if str1 > str2.
 */
goog.string.numerateCompare = function(str1, str2) {
  if (str1 == str2) {
    return 0;
  }
  if (!str1) {
    return -1;
  }
  if (!str2) {
    return 1;
  }

  // Using match to split the entire string ahead of time turns out to be faster
  // for most inputs than using RegExp.exec or iterating over each character.
  var tokens1 = str1.toLowerCase().match(goog.string.numerateCompareRegExp_);
  var tokens2 = str2.toLowerCase().match(goog.string.numerateCompareRegExp_);

  var count = Math.min(tokens1.length, tokens2.length);

  for (var i = 0; i < count; i++) {
    var a = tokens1[i];
    var b = tokens2[i];

    // Compare pairs of tokens, returning if one token sorts before the other.
    if (a != b) {

      // Only if both tokens are integers is a special comparison required.
      // Decimal numbers are sorted as strings (e.g., '.09' < '.1').
      var num1 = parseInt(a, 10);
      if (!isNaN(num1)) {
        var num2 = parseInt(b, 10);
        if (!isNaN(num2) && num1 - num2) {
          return num1 - num2;
        }
      }
      return a < b ? -1 : 1;
    }
  }

  // If one string is a substring of the other, the shorter string sorts first.
  if (tokens1.length != tokens2.length) {
    return tokens1.length - tokens2.length;
  }

  // The two strings must be equivalent except for case (perfect equality is
  // tested at the head of the function.) Revert to default ASCII-betical string
  // comparison to stablize the sort.
  return str1 < str2 ? -1 : 1;
};


/**
 * Regular expression used for determining if a string needs to be encoded.
 * @type {RegExp}
 * @private
 */
goog.string.encodeUriRegExp_ = /^[a-zA-Z0-9\-_.!~*'()]*$/;


/**
 * URL-encodes a string
 * @param {*} str The string to url-encode.
 * @return {string} An encoded copy of {@code str} that is safe for urls.
 *     Note that '#', ':', and other characters used to delimit portions
 *     of URLs *will* be encoded.
 */
goog.string.urlEncode = function(str) {
  str = String(str);
  // Checking if the search matches before calling encodeURIComponent avoids an
  // extra allocation in IE6. This adds about 10us time in FF and a similiar
  // over head in IE6 for lower working set apps, but for large working set
  // apps like Gmail, it saves about 70us per call.
  if (!goog.string.encodeUriRegExp_.test(str)) {
    return encodeURIComponent(str);
  }
  return str;
};


/**
 * URL-decodes the string. We need to specially handle '+'s because
 * the javascript library doesn't convert them to spaces.
 * @param {string} str The string to url decode.
 * @return {string} The decoded {@code str}.
 */
goog.string.urlDecode = function(str) {
  return decodeURIComponent(str.replace(/\+/g, ' '));
};


/**
 * Converts \n to <br>s or <br />s.
 * @param {string} str The string in which to convert newlines.
 * @param {boolean=} opt_xml Whether to use XML compatible tags.
 * @return {string} A copy of {@code str} with converted newlines.
 */
goog.string.newLineToBr = function(str, opt_xml) {
  return str.replace(/(\r\n|\r|\n)/g, opt_xml ? '<br />' : '<br>');
};


/**
 * Escape double quote '"' characters in addition to '&', '<', and '>' so that a
 * string can be included in an HTML tag attribute value within double quotes.
 *
 * It should be noted that > doesn't need to be escaped for the HTML or XML to
 * be valid, but it has been decided to escape it for consistency with other
 * implementations.
 *
 * NOTE(user):
 * HtmlEscape is often called during the generation of large blocks of HTML.
 * Using statics for the regular expressions and strings is an optimization
 * that can more than half the amount of time IE spends in this function for
 * large apps, since strings and regexes both contribute to GC allocations.
 *
 * Testing for the presence of a character before escaping increases the number
 * of function calls, but actually provides a speed increase for the average
 * case -- since the average case often doesn't require the escaping of all 4
 * characters and indexOf() is much cheaper than replace().
 * The worst case does suffer slightly from the additional calls, therefore the
 * opt_isLikelyToContainHtmlChars option has been included for situations
 * where all 4 HTML entities are very likely to be present and need escaping.
 *
 * Some benchmarks (times tended to fluctuate +-0.05ms):
 *                                     FireFox                     IE6
 * (no chars / average (mix of cases) / all 4 chars)
 * no checks                     0.13 / 0.22 / 0.22         0.23 / 0.53 / 0.80
 * indexOf                       0.08 / 0.17 / 0.26         0.22 / 0.54 / 0.84
 * indexOf + re test             0.07 / 0.17 / 0.28         0.19 / 0.50 / 0.85
 *
 * An additional advantage of checking if replace actually needs to be called
 * is a reduction in the number of object allocations, so as the size of the
 * application grows the difference between the various methods would increase.
 *
 * @param {string} str string to be escaped.
 * @param {boolean=} opt_isLikelyToContainHtmlChars Don't perform a check to see
 *     if the character needs replacing - use this option if you expect each of
 *     the characters to appear often. Leave false if you expect few html
 *     characters to occur in your strings, such as if you are escaping HTML.
 * @return {string} An escaped copy of {@code str}.
 */
goog.string.htmlEscape = function(str, opt_isLikelyToContainHtmlChars) {

  if (opt_isLikelyToContainHtmlChars) {
    return str.replace(goog.string.amperRe_, '&amp;')
          .replace(goog.string.ltRe_, '&lt;')
          .replace(goog.string.gtRe_, '&gt;')
          .replace(goog.string.quotRe_, '&quot;');

  } else {
    // quick test helps in the case when there are no chars to replace, in
    // worst case this makes barely a difference to the time taken
    if (!goog.string.allRe_.test(str)) return str;

    // str.indexOf is faster than regex.test in this case
    if (str.indexOf('&') != -1) {
      str = str.replace(goog.string.amperRe_, '&amp;');
    }
    if (str.indexOf('<') != -1) {
      str = str.replace(goog.string.ltRe_, '&lt;');
    }
    if (str.indexOf('>') != -1) {
      str = str.replace(goog.string.gtRe_, '&gt;');
    }
    if (str.indexOf('"') != -1) {
      str = str.replace(goog.string.quotRe_, '&quot;');
    }
    return str;
  }
};


/**
 * Regular expression that matches an ampersand, for use in escaping.
 * @type {RegExp}
 * @private
 */
goog.string.amperRe_ = /&/g;


/**
 * Regular expression that matches a less than sign, for use in escaping.
 * @type {RegExp}
 * @private
 */
goog.string.ltRe_ = /</g;


/**
 * Regular expression that matches a greater than sign, for use in escaping.
 * @type {RegExp}
 * @private
 */
goog.string.gtRe_ = />/g;


/**
 * Regular expression that matches a double quote, for use in escaping.
 * @type {RegExp}
 * @private
 */
goog.string.quotRe_ = /\"/g;


/**
 * Regular expression that matches any character that needs to be escaped.
 * @type {RegExp}
 * @private
 */
goog.string.allRe_ = /[&<>\"]/;


/**
 * Unescapes an HTML string.
 *
 * @param {string} str The string to unescape.
 * @return {string} An unescaped copy of {@code str}.
 */
goog.string.unescapeEntities = function(str) {
  if (goog.string.contains(str, '&')) {
    // We are careful not to use a DOM if we do not have one. We use the []
    // notation so that the JSCompiler will not complain about these objects and
    // fields in the case where we have no DOM.
    if ('document' in goog.global) {
      return goog.string.unescapeEntitiesUsingDom_(str);
    } else {
      // Fall back on pure XML entities
      return goog.string.unescapePureXmlEntities_(str);
    }
  }
  return str;
};


/**
 * Unescapes an HTML string using a DOM to resolve non-XML, non-numeric
 * entities. This function is XSS-safe and whitespace-preserving.
 * @private
 * @param {string} str The string to unescape.
 * @return {string} The unescaped {@code str} string.
 */
goog.string.unescapeEntitiesUsingDom_ = function(str) {
  var seen = {'&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"'};
  var div = document.createElement('div');
  // Match as many valid entity characters as possible. If the actual entity
  // happens to be shorter, it will still work as innerHTML will return the
  // trailing characters unchanged. Since the entity characters do not include
  // open angle bracket, there is no chance of XSS from the innerHTML use.
  // Since no whitespace is passed to innerHTML, whitespace is preserved.
  return str.replace(goog.string.HTML_ENTITY_PATTERN_, function(s, entity) {
    // Check for cached entity.
    var value = seen[s];
    if (value) {
      return value;
    }
    // Check for numeric entity.
    if (entity.charAt(0) == '#') {
      // Prefix with 0 so that hex entities (e.g. &#x10) parse as hex numbers.
      var n = Number('0' + entity.substr(1));
      if (!isNaN(n)) {
        value = String.fromCharCode(n);
      }
    }
    // Fall back to innerHTML otherwise.
    if (!value) {
      // Append a non-entity character to avoid a bug in Webkit that parses
      // an invalid entity at the end of innerHTML text as the empty string.
      div.innerHTML = s + ' ';
      // Then remove the trailing character from the result.
      value = div.firstChild.nodeValue.slice(0, -1);
    }
    // Cache and return.
    return seen[s] = value;
  });
};


/**
 * Unescapes XML entities.
 * @private
 * @param {string} str The string to unescape.
 * @return {string} An unescaped copy of {@code str}.
 */
goog.string.unescapePureXmlEntities_ = function(str) {
  return str.replace(/&([^;]+);/g, function(s, entity) {
    switch (entity) {
      case 'amp':
        return '&';
      case 'lt':
        return '<';
      case 'gt':
        return '>';
      case 'quot':
        return '"';
      default:
        if (entity.charAt(0) == '#') {
          // Prefix with 0 so that hex entities (e.g. &#x10) parse as hex.
          var n = Number('0' + entity.substr(1));
          if (!isNaN(n)) {
            return String.fromCharCode(n);
          }
        }
        // For invalid entities we just return the entity
        return s;
    }
  });
};


/**
 * Regular expression that matches an HTML entity.
 * See also HTML5: Tokenization / Tokenizing character references.
 * @private
 * @type {!RegExp}
 */
goog.string.HTML_ENTITY_PATTERN_ = /&([^;\s<&]+);?/g;


/**
 * Do escaping of whitespace to preserve spatial formatting. We use character
 * entity #160 to make it safer for xml.
 * @param {string} str The string in which to escape whitespace.
 * @param {boolean=} opt_xml Whether to use XML compatible tags.
 * @return {string} An escaped copy of {@code str}.
 */
goog.string.whitespaceEscape = function(str, opt_xml) {
  return goog.string.newLineToBr(str.replace(/  /g, ' &#160;'), opt_xml);
};


/**
 * Strip quote characters around a string.  The second argument is a string of
 * characters to treat as quotes.  This can be a single character or a string of
 * multiple character and in that case each of those are treated as possible
 * quote characters. For example:
 *
 * <pre>
 * goog.string.stripQuotes('"abc"', '"`') --> 'abc'
 * goog.string.stripQuotes('`abc`', '"`') --> 'abc'
 * </pre>
 *
 * @param {string} str The string to strip.
 * @param {string} quoteChars The quote characters to strip.
 * @return {string} A copy of {@code str} without the quotes.
 */
goog.string.stripQuotes = function(str, quoteChars) {
  var length = quoteChars.length;
  for (var i = 0; i < length; i++) {
    var quoteChar = length == 1 ? quoteChars : quoteChars.charAt(i);
    if (str.charAt(0) == quoteChar && str.charAt(str.length - 1) == quoteChar) {
      return str.substring(1, str.length - 1);
    }
  }
  return str;
};


/**
 * Truncates a string to a certain length and adds '...' if necessary.  The
 * length also accounts for the ellipsis, so a maximum length of 10 and a string
 * 'Hello World!' produces 'Hello W...'.
 * @param {string} str The string to truncate.
 * @param {number} chars Max number of characters.
 * @param {boolean=} opt_protectEscapedCharacters Whether to protect escaped
 *     characters from being cut off in the middle.
 * @return {string} The truncated {@code str} string.
 */
goog.string.truncate = function(str, chars, opt_protectEscapedCharacters) {
  if (opt_protectEscapedCharacters) {
    str = goog.string.unescapeEntities(str);
  }

  if (str.length > chars) {
    str = str.substring(0, chars - 3) + '...';
  }

  if (opt_protectEscapedCharacters) {
    str = goog.string.htmlEscape(str);
  }

  return str;
};


/**
 * Truncate a string in the middle, adding "..." if necessary,
 * and favoring the beginning of the string.
 * @param {string} str The string to truncate the middle of.
 * @param {number} chars Max number of characters.
 * @param {boolean=} opt_protectEscapedCharacters Whether to protect escaped
 *     characters from being cutoff in the middle.
 * @param {number=} opt_trailingChars Optional number of trailing characters to
 *     leave at the end of the string, instead of truncating as close to the
 *     middle as possible.
 * @return {string} A truncated copy of {@code str}.
 */
goog.string.truncateMiddle = function(str, chars,
    opt_protectEscapedCharacters, opt_trailingChars) {
  if (opt_protectEscapedCharacters) {
    str = goog.string.unescapeEntities(str);
  }

  if (opt_trailingChars && str.length > chars) {
    if (opt_trailingChars > chars) {
      opt_trailingChars = chars;
    }
    var endPoint = str.length - opt_trailingChars;
    var startPoint = chars - opt_trailingChars;
    str = str.substring(0, startPoint) + '...' + str.substring(endPoint);
  } else if (str.length > chars) {
    // Favor the beginning of the string:
    var half = Math.floor(chars / 2);
    var endPos = str.length - half;
    half += chars % 2;
    str = str.substring(0, half) + '...' + str.substring(endPos);
  }

  if (opt_protectEscapedCharacters) {
    str = goog.string.htmlEscape(str);
  }

  return str;
};


/**
 * Special chars that need to be escaped for goog.string.quote.
 * @private
 * @type {Object}
 */
goog.string.specialEscapeChars_ = {
  '\0': '\\0',
  '\b': '\\b',
  '\f': '\\f',
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',
  '\x0B': '\\x0B', // '\v' is not supported in JScript
  '"': '\\"',
  '\\': '\\\\'
};


/**
 * Character mappings used internally for goog.string.escapeChar.
 * @private
 * @type {Object}
 */
goog.string.jsEscapeCache_ = {
  '\'': '\\\''
};


/**
 * Encloses a string in double quotes and escapes characters so that the
 * string is a valid JS string.
 * @param {string} s The string to quote.
 * @return {string} A copy of {@code s} surrounded by double quotes.
 */
goog.string.quote = function(s) {
  s = String(s);
  if (s.quote) {
    return s.quote();
  } else {
    var sb = ['"'];
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i);
      var cc = ch.charCodeAt(0);
      sb[i + 1] = goog.string.specialEscapeChars_[ch] ||
          ((cc > 31 && cc < 127) ? ch : goog.string.escapeChar(ch));
    }
    sb.push('"');
    return sb.join('');
  }
};


/**
 * Takes a string and returns the escaped string for that character.
 * @param {string} str The string to escape.
 * @return {string} An escaped string representing {@code str}.
 */
goog.string.escapeString = function(str) {
  var sb = [];
  for (var i = 0; i < str.length; i++) {
    sb[i] = goog.string.escapeChar(str.charAt(i));
  }
  return sb.join('');
};


/**
 * Takes a character and returns the escaped string for that character. For
 * example escapeChar(String.fromCharCode(15)) -> "\\x0E".
 * @param {string} c The character to escape.
 * @return {string} An escaped string representing {@code c}.
 */
goog.string.escapeChar = function(c) {
  if (c in goog.string.jsEscapeCache_) {
    return goog.string.jsEscapeCache_[c];
  }

  if (c in goog.string.specialEscapeChars_) {
    return goog.string.jsEscapeCache_[c] = goog.string.specialEscapeChars_[c];
  }

  var rv = c;
  var cc = c.charCodeAt(0);
  if (cc > 31 && cc < 127) {
    rv = c;
  } else {
    // tab is 9 but handled above
    if (cc < 256) {
      rv = '\\x';
      if (cc < 16 || cc > 256) {
        rv += '0';
      }
    } else {
      rv = '\\u';
      if (cc < 4096) { // \u1000
        rv += '0';
      }
    }
    rv += cc.toString(16).toUpperCase();
  }

  return goog.string.jsEscapeCache_[c] = rv;
};


/**
 * Takes a string and creates a map (Object) in which the keys are the
 * characters in the string. The value for the key is set to true. You can
 * then use goog.object.map or goog.array.map to change the values.
 * @param {string} s The string to build the map from.
 * @return {Object} The map of characters used.
 */
// TODO(arv): It seems like we should have a generic goog.array.toMap. But do
//            we want a dependency on goog.array in goog.string?
goog.string.toMap = function(s) {
  var rv = {};
  for (var i = 0; i < s.length; i++) {
    rv[s.charAt(i)] = true;
  }
  return rv;
};


/**
 * Checks whether a string contains a given character.
 * @param {string} s The string to test.
 * @param {string} ss The substring to test for.
 * @return {boolean} True if {@code s} contains {@code ss}.
 */
goog.string.contains = function(s, ss) {
  return s.indexOf(ss) != -1;
};


/**
 * Returns the non-overlapping occurrences of ss in s.
 * If either s or ss evalutes to false, then returns zero.
 * @param {string} s The string to look in.
 * @param {string} ss The string to look for.
 * @return {number} Number of occurrences of ss in s.
 */
goog.string.countOf = function(s, ss) {
  return s && ss ? s.split(ss).length - 1 : 0;
};


/**
 * Removes a substring of a specified length at a specific
 * index in a string.
 * @param {string} s The base string from which to remove.
 * @param {number} index The index at which to remove the substring.
 * @param {number} stringLength The length of the substring to remove.
 * @return {string} A copy of {@code s} with the substring removed or the full
 *     string if nothing is removed or the input is invalid.
 */
goog.string.removeAt = function(s, index, stringLength) {
  var resultStr = s;
  // If the index is greater or equal to 0 then remove substring
  if (index >= 0 && index < s.length && stringLength > 0) {
    resultStr = s.substr(0, index) +
        s.substr(index + stringLength, s.length - index - stringLength);
  }
  return resultStr;
};


/**
 *  Removes the first occurrence of a substring from a string.
 *  @param {string} s The base string from which to remove.
 *  @param {string} ss The string to remove.
 *  @return {string} A copy of {@code s} with {@code ss} removed or the full
 *      string if nothing is removed.
 */
goog.string.remove = function(s, ss) {
  var re = new RegExp(goog.string.regExpEscape(ss), '');
  return s.replace(re, '');
};


/**
 *  Removes all occurrences of a substring from a string.
 *  @param {string} s The base string from which to remove.
 *  @param {string} ss The string to remove.
 *  @return {string} A copy of {@code s} with {@code ss} removed or the full
 *      string if nothing is removed.
 */
goog.string.removeAll = function(s, ss) {
  var re = new RegExp(goog.string.regExpEscape(ss), 'g');
  return s.replace(re, '');
};


/**
 * Escapes characters in the string that are not safe to use in a RegExp.
 * @param {*} s The string to escape. If not a string, it will be casted
 *     to one.
 * @return {string} A RegExp safe, escaped copy of {@code s}.
 */
goog.string.regExpEscape = function(s) {
  return String(s).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').
      replace(/\x08/g, '\\x08');
};


/**
 * Repeats a string n times.
 * @param {string} string The string to repeat.
 * @param {number} length The number of times to repeat.
 * @return {string} A string containing {@code length} repetitions of
 *     {@code string}.
 */
goog.string.repeat = function(string, length) {
  return new Array(length + 1).join(string);
};


/**
 * Pads number to given length and optionally rounds it to a given precision.
 * For example:
 * <pre>padNumber(1.25, 2, 3) -> '01.250'
 * padNumber(1.25, 2) -> '01.25'
 * padNumber(1.25, 2, 1) -> '01.3'
 * padNumber(1.25, 0) -> '1.25'</pre>
 *
 * @param {number} num The number to pad.
 * @param {number} length The desired length.
 * @param {number=} opt_precision The desired precision.
 * @return {string} {@code num} as a string with the given options.
 */
goog.string.padNumber = function(num, length, opt_precision) {
  var s = goog.isDef(opt_precision) ? num.toFixed(opt_precision) : String(num);
  var index = s.indexOf('.');
  if (index == -1) {
    index = s.length;
  }
  return goog.string.repeat('0', Math.max(0, length - index)) + s;
};


/**
 * Returns a string representation of the given object, with
 * null and undefined being returned as the empty string.
 *
 * @param {*} obj The object to convert.
 * @return {string} A string representation of the {@code obj}.
 */
goog.string.makeSafe = function(obj) {
  return obj == null ? '' : String(obj);
};


/**
 * Concatenates string expressions. This is useful
 * since some browsers are very inefficient when it comes to using plus to
 * concat strings. Be careful when using null and undefined here since
 * these will not be included in the result. If you need to represent these
 * be sure to cast the argument to a String first.
 * For example:
 * <pre>buildString('a', 'b', 'c', 'd') -> 'abcd'
 * buildString(null, undefined) -> ''
 * </pre>
 * @param {...*} var_args A list of strings to concatenate. If not a string,
 *     it will be casted to one.
 * @return {string} The concatenation of {@code var_args}.
 */
goog.string.buildString = function(var_args) {
  return Array.prototype.join.call(arguments, '');
};


/**
 * Returns a string with at least 64-bits of randomness.
 *
 * Doesn't trust Javascript's random function entirely. Uses a combination of
 * random and current timestamp, and then encodes the string in base-36 to
 * make it shorter.
 *
 * @return {string} A random string, e.g. sn1s7vb4gcic.
 */
goog.string.getRandomString = function() {
  var x = 2147483648;
  return Math.floor(Math.random() * x).toString(36) +
         Math.abs(Math.floor(Math.random() * x) ^ goog.now()).toString(36);
};


/**
 * Compares two version numbers.
 *
 * @param {string|number} version1 Version of first item.
 * @param {string|number} version2 Version of second item.
 *
 * @return {number}  1 if {@code version1} is higher.
 *                   0 if arguments are equal.
 *                  -1 if {@code version2} is higher.
 */
goog.string.compareVersions = function(version1, version2) {
  var order = 0;
  // Trim leading and trailing whitespace and split the versions into
  // subversions.
  var v1Subs = goog.string.trim(String(version1)).split('.');
  var v2Subs = goog.string.trim(String(version2)).split('.');
  var subCount = Math.max(v1Subs.length, v2Subs.length);

  // Iterate over the subversions, as long as they appear to be equivalent.
  for (var subIdx = 0; order == 0 && subIdx < subCount; subIdx++) {
    var v1Sub = v1Subs[subIdx] || '';
    var v2Sub = v2Subs[subIdx] || '';

    // Split the subversions into pairs of numbers and qualifiers (like 'b').
    // Two different RegExp objects are needed because they are both using
    // the 'g' flag.
    var v1CompParser = new RegExp('(\\d*)(\\D*)', 'g');
    var v2CompParser = new RegExp('(\\d*)(\\D*)', 'g');
    do {
      var v1Comp = v1CompParser.exec(v1Sub) || ['', '', ''];
      var v2Comp = v2CompParser.exec(v2Sub) || ['', '', ''];
      // Break if there are no more matches.
      if (v1Comp[0].length == 0 && v2Comp[0].length == 0) {
        break;
      }

      // Parse the numeric part of the subversion. A missing number is
      // equivalent to 0.
      var v1CompNum = v1Comp[1].length == 0 ? 0 : parseInt(v1Comp[1], 10);
      var v2CompNum = v2Comp[1].length == 0 ? 0 : parseInt(v2Comp[1], 10);

      // Compare the subversion components. The number has the highest
      // precedence. Next, if the numbers are equal, a subversion without any
      // qualifier is always higher than a subversion with any qualifier. Next,
      // the qualifiers are compared as strings.
      order = goog.string.compareElements_(v1CompNum, v2CompNum) ||
          goog.string.compareElements_(v1Comp[2].length == 0,
              v2Comp[2].length == 0) ||
          goog.string.compareElements_(v1Comp[2], v2Comp[2]);
      // Stop as soon as an inequality is discovered.
    } while (order == 0);
  }

  return order;
};


/**
 * Compares elements of a version number.
 *
 * @param {string|number|boolean} left An element from a version number.
 * @param {string|number|boolean} right An element from a version number.
 *
 * @return {number}  1 if {@code left} is higher.
 *                   0 if arguments are equal.
 *                  -1 if {@code right} is higher.
 * @private
 */
goog.string.compareElements_ = function(left, right) {
  if (left < right) {
    return -1;
  } else if (left > right) {
    return 1;
  }
  return 0;
};


/**
 * Maximum value of #goog.string.hashCode, exclusive. 2^32.
 * @type {number}
 * @private
 */
goog.string.HASHCODE_MAX_ = 0x100000000;


/**
 * String hash function similar to java.lang.String.hashCode().
 * The hash code for a string is computed as
 * s[0] * 31 ^ (n - 1) + s[1] * 31 ^ (n - 2) + ... + s[n - 1],
 * where s[i] is the ith character of the string and n is the length of
 * the string. We mod the result to make it between 0 (inclusive) and 2^32
 * (exclusive).
 * @param {string} str A string.
 * @return {number} Hash value for {@code str}, between 0 (inclusive) and 2^32
 *  (exclusive). The empty string returns 0.
 */
goog.string.hashCode = function(str) {
  var result = 0;
  for (var i = 0; i < str.length; ++i) {
    result = 31 * result + str.charCodeAt(i);
    // Normalize to 4 byte range, 0 ... 2^32.
    result %= goog.string.HASHCODE_MAX_;
  }
  return result;
};


/**
 * The most recent unique ID. |0 is equivalent to Math.floor in this case.
 * @type {number}
 * @private
 */
goog.string.uniqueStringCounter_ = Math.random() * 0x80000000 | 0;


/**
 * Generates and returns a string which is unique in the current document.
 * This is useful, for example, to create unique IDs for DOM elements.
 * @return {string} A unique id.
 */
goog.string.createUniqueString = function() {
  return 'goog_' + goog.string.uniqueStringCounter_++;
};


/**
 * Converts the supplied string to a number, which may be Ininity or NaN.
 * This function strips whitespace: (toNumber(' 123') === 123)
 * This function accepts scientific notation: (toNumber('1e1') === 10)
 *
 * This is better than Javascript's built-in conversions because, sadly:
 *     (Number(' ') === 0) and (parseFloat('123a') === 123)
 *
 * @param {string} str The string to convert.
 * @return {number} The number the supplied string represents, or NaN.
 */
goog.string.toNumber = function(str) {
  var num = Number(str);
  if (num == 0 && goog.string.isEmpty(str)) {
    return NaN;
  }
  return num;
};


/**
 * A memoized cache for goog.string.toCamelCase.
 * @type {Object.<string>}
 * @private
 */
goog.string.toCamelCaseCache_ = {};


/**
 * Converts a string from selector-case to camelCase (e.g. from
 * "multi-part-string" to "multiPartString"), useful for converting
 * CSS selectors and HTML dataset keys to their equivalent JS properties.
 * @param {string} str The string in selector-case form.
 * @return {string} The string in camelCase form.
 */
goog.string.toCamelCase = function(str) {
  return goog.string.toCamelCaseCache_[str] ||
      (goog.string.toCamelCaseCache_[str] =
          String(str).replace(/\-([a-z])/g, function(all, match) {
            return match.toUpperCase();
          }));
};


/**
 * A memoized cache for goog.string.toSelectorCase.
 * @type {Object.<string>}
 * @private
 */
goog.string.toSelectorCaseCache_ = {};


/**
 * Converts a string from camelCase to selector-case (e.g. from
 * "multiPartString" to "multi-part-string"), useful for converting JS
 * style and dataset properties to equivalent CSS selectors and HTML keys.
 * @param {string} str The string in camelCase form.
 * @return {string} The string in selector-case form.
 */
goog.string.toSelectorCase = function(str) {
  return goog.string.toSelectorCaseCache_[str] ||
      (goog.string.toSelectorCaseCache_[str] =
          String(str).replace(/([A-Z])/g, '-$1').toLowerCase());
};
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Rendering engine detection.
 * @see <a href="http://www.useragentstring.com/">User agent strings</a>
 * For information on the browser brand (such as Safari versus Chrome), see
 * goog.userAgent.product.
 * @see ../demos/useragent.html
 */

goog.provide('goog.userAgent');

goog.require('goog.string');


/**
 * @define {boolean} Whether we know at compile-time that the browser is IE.
 */
goog.userAgent.ASSUME_IE = false;


/**
 * @define {boolean} Whether we know at compile-time that the browser is GECKO.
 */
goog.userAgent.ASSUME_GECKO = false;


/**
 * @define {boolean} Whether we know at compile-time that the browser is WEBKIT.
 */
goog.userAgent.ASSUME_WEBKIT = false;


/**
 * @define {boolean} Whether we know at compile-time that the browser is a
 *     mobile device running WebKit e.g. iPhone or Android.
 */
goog.userAgent.ASSUME_MOBILE_WEBKIT = false;


/**
 * @define {boolean} Whether we know at compile-time that the browser is OPERA.
 */
goog.userAgent.ASSUME_OPERA = false;


/**
 * @define {boolean} Whether the {@code goog.userAgent.isVersion} function will
 *     return true for any version.
 */
goog.userAgent.ASSUME_ANY_VERSION = false;


/**
 * Whether we know the browser engine at compile-time.
 * @type {boolean}
 * @private
 */
goog.userAgent.BROWSER_KNOWN_ =
    goog.userAgent.ASSUME_IE ||
    goog.userAgent.ASSUME_GECKO ||
    goog.userAgent.ASSUME_MOBILE_WEBKIT ||
    goog.userAgent.ASSUME_WEBKIT ||
    goog.userAgent.ASSUME_OPERA;


/**
 * Returns the userAgent string for the current browser.
 * Some user agents (I'm thinking of you, Gears WorkerPool) do not expose a
 * navigator object off the global scope.  In that case we return null.
 *
 * @return {?string} The userAgent string or null if there is none.
 */
goog.userAgent.getUserAgentString = function() {
  return goog.global['navigator'] ? goog.global['navigator'].userAgent : null;
};


/**
 * @return {Object} The native navigator object.
 */
goog.userAgent.getNavigator = function() {
  // Need a local navigator reference instead of using the global one,
  // to avoid the rare case where they reference different objects.
  // (goog.gears.FakeWorkerPool, for example).
  return goog.global['navigator'];
};


/**
 * Initializer for goog.userAgent.
 *
 * This is a named function so that it can be stripped via the jscompiler
 * option for stripping types.
 * @private
 */
goog.userAgent.init_ = function() {
  /**
   * Whether the user agent string denotes Opera.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedOpera_ = false;

  /**
   * Whether the user agent string denotes Internet Explorer. This includes
   * other browsers using Trident as its rendering engine. For example AOL
   * and Netscape 8
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedIe_ = false;

  /**
   * Whether the user agent string denotes WebKit. WebKit is the rendering
   * engine that Safari, Android and others use.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedWebkit_ = false;

  /**
   * Whether the user agent string denotes a mobile device.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedMobile_ = false;

  /**
   * Whether the user agent string denotes Gecko. Gecko is the rendering
   * engine used by Mozilla, Mozilla Firefox, Camino and many more.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedGecko_ = false;

  var ua;
  if (!goog.userAgent.BROWSER_KNOWN_ &&
      (ua = goog.userAgent.getUserAgentString())) {
    var navigator = goog.userAgent.getNavigator();
    goog.userAgent.detectedOpera_ = ua.indexOf('Opera') == 0;
    goog.userAgent.detectedIe_ = !goog.userAgent.detectedOpera_ &&
        ua.indexOf('MSIE') != -1;
    goog.userAgent.detectedWebkit_ = !goog.userAgent.detectedOpera_ &&
        ua.indexOf('WebKit') != -1;
    // WebKit also gives navigator.product string equal to 'Gecko'.
    goog.userAgent.detectedMobile_ = goog.userAgent.detectedWebkit_ &&
        ua.indexOf('Mobile') != -1;
    goog.userAgent.detectedGecko_ = !goog.userAgent.detectedOpera_ &&
        !goog.userAgent.detectedWebkit_ && navigator.product == 'Gecko';
  }
};


if (!goog.userAgent.BROWSER_KNOWN_) {
  goog.userAgent.init_();
}


/**
 * Whether the user agent is Opera.
 * @type {boolean}
 */
goog.userAgent.OPERA = goog.userAgent.BROWSER_KNOWN_ ?
    goog.userAgent.ASSUME_OPERA : goog.userAgent.detectedOpera_;


/**
 * Whether the user agent is Internet Explorer. This includes other browsers
 * using Trident as its rendering engine. For example AOL and Netscape 8
 * @type {boolean}
 */
goog.userAgent.IE = goog.userAgent.BROWSER_KNOWN_ ?
    goog.userAgent.ASSUME_IE : goog.userAgent.detectedIe_;


/**
 * Whether the user agent is Gecko. Gecko is the rendering engine used by
 * Mozilla, Mozilla Firefox, Camino and many more.
 * @type {boolean}
 */
goog.userAgent.GECKO = goog.userAgent.BROWSER_KNOWN_ ?
    goog.userAgent.ASSUME_GECKO :
    goog.userAgent.detectedGecko_;


/**
 * Whether the user agent is WebKit. WebKit is the rendering engine that
 * Safari, Android and others use.
 * @type {boolean}
 */
goog.userAgent.WEBKIT = goog.userAgent.BROWSER_KNOWN_ ?
    goog.userAgent.ASSUME_WEBKIT || goog.userAgent.ASSUME_MOBILE_WEBKIT :
    goog.userAgent.detectedWebkit_;


/**
 * Whether the user agent is running on a mobile device.
 * @type {boolean}
 */
goog.userAgent.MOBILE = goog.userAgent.ASSUME_MOBILE_WEBKIT ||
                        goog.userAgent.detectedMobile_;


/**
 * Used while transitioning code to use WEBKIT instead.
 * @type {boolean}
 * @deprecated Use {@link goog.userAgent.product.SAFARI} instead.
 * TODO(nicksantos): Delete this from goog.userAgent.
 */
goog.userAgent.SAFARI = goog.userAgent.WEBKIT;


/**
 * @return {string} the platform (operating system) the user agent is running
 *     on. Default to empty string because navigator.platform may not be defined
 *     (on Rhino, for example).
 * @private
 */
goog.userAgent.determinePlatform_ = function() {
  var navigator = goog.userAgent.getNavigator();
  return navigator && navigator.platform || '';
};


/**
 * The platform (operating system) the user agent is running on. Default to
 * empty string because navigator.platform may not be defined (on Rhino, for
 * example).
 * @type {string}
 */
goog.userAgent.PLATFORM = goog.userAgent.determinePlatform_();


/**
 * @define {boolean} Whether the user agent is running on a Macintosh operating
 *     system.
 */
goog.userAgent.ASSUME_MAC = false;


/**
 * @define {boolean} Whether the user agent is running on a Windows operating
 *     system.
 */
goog.userAgent.ASSUME_WINDOWS = false;


/**
 * @define {boolean} Whether the user agent is running on a Linux operating
 *     system.
 */
goog.userAgent.ASSUME_LINUX = false;


/**
 * @define {boolean} Whether the user agent is running on a X11 windowing
 *     system.
 */
goog.userAgent.ASSUME_X11 = false;


/**
 * @type {boolean}
 * @private
 */
goog.userAgent.PLATFORM_KNOWN_ =
    goog.userAgent.ASSUME_MAC ||
    goog.userAgent.ASSUME_WINDOWS ||
    goog.userAgent.ASSUME_LINUX ||
    goog.userAgent.ASSUME_X11;


/**
 * Initialize the goog.userAgent constants that define which platform the user
 * agent is running on.
 * @private
 */
goog.userAgent.initPlatform_ = function() {
  /**
   * Whether the user agent is running on a Macintosh operating system.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedMac_ = goog.string.contains(goog.userAgent.PLATFORM,
      'Mac');

  /**
   * Whether the user agent is running on a Windows operating system.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedWindows_ = goog.string.contains(
      goog.userAgent.PLATFORM, 'Win');

  /**
   * Whether the user agent is running on a Linux operating system.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedLinux_ = goog.string.contains(goog.userAgent.PLATFORM,
      'Linux');

  /**
   * Whether the user agent is running on a X11 windowing system.
   * @type {boolean}
   * @private
   */
  goog.userAgent.detectedX11_ = !!goog.userAgent.getNavigator() &&
      goog.string.contains(goog.userAgent.getNavigator()['appVersion'] || '',
          'X11');
};


if (!goog.userAgent.PLATFORM_KNOWN_) {
  goog.userAgent.initPlatform_();
}


/**
 * Whether the user agent is running on a Macintosh operating system.
 * @type {boolean}
 */
goog.userAgent.MAC = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_MAC : goog.userAgent.detectedMac_;


/**
 * Whether the user agent is running on a Windows operating system.
 * @type {boolean}
 */
goog.userAgent.WINDOWS = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_WINDOWS : goog.userAgent.detectedWindows_;


/**
 * Whether the user agent is running on a Linux operating system.
 * @type {boolean}
 */
goog.userAgent.LINUX = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_LINUX : goog.userAgent.detectedLinux_;


/**
 * Whether the user agent is running on a X11 windowing system.
 * @type {boolean}
 */
goog.userAgent.X11 = goog.userAgent.PLATFORM_KNOWN_ ?
    goog.userAgent.ASSUME_X11 : goog.userAgent.detectedX11_;


/**
 * @return {string} The string that describes the version number of the user
 *     agent.
 * @private
 */
goog.userAgent.determineVersion_ = function() {
  // All browsers have different ways to detect the version and they all have
  // different naming schemes.

  // version is a string rather than a number because it may contain 'b', 'a',
  // and so on.
  var version = '', re;

  if (goog.userAgent.OPERA && goog.global['opera']) {
    var operaVersion = goog.global['opera'].version;
    version = typeof operaVersion == 'function' ? operaVersion() : operaVersion;
  } else {
    if (goog.userAgent.GECKO) {
      re = /rv\:([^\);]+)(\)|;)/;
    } else if (goog.userAgent.IE) {
      re = /MSIE\s+([^\);]+)(\)|;)/;
    } else if (goog.userAgent.WEBKIT) {
      // WebKit/125.4
      re = /WebKit\/(\S+)/;
    }
    if (re) {
      var arr = re.exec(goog.userAgent.getUserAgentString());
      version = arr ? arr[1] : '';
    }
  }
  if (goog.userAgent.IE) {
    // IE9 can be in document mode 9 but be reporting an inconsistent user agent
    // version.  If it is identifying as a version lower than 9 we take the
    // documentMode as the version instead.  IE8 has similar behavior.
    // It is recommended to set the X-UA-Compatible header to ensure that IE9
    // uses documentMode 9.
    var docMode = goog.userAgent.getDocumentMode_();
    if (docMode > parseFloat(version)) {
      return String(docMode);
    }
  }
  return version;
};


/**
 * @return {number|undefined} Returns the document mode (for testing).
 * @private
 */
goog.userAgent.getDocumentMode_ = function() {
  // NOTE(user): goog.userAgent may be used in context where there is no DOM.
  var doc = goog.global['document'];
  return doc ? doc['documentMode'] : undefined;
};


/**
 * The version of the user agent. This is a string because it might contain
 * 'b' (as in beta) as well as multiple dots.
 * @type {string}
 */
goog.userAgent.VERSION = goog.userAgent.determineVersion_();


/**
 * Compares two version numbers.
 *
 * @param {string} v1 Version of first item.
 * @param {string} v2 Version of second item.
 *
 * @return {number}  1 if first argument is higher
 *                   0 if arguments are equal
 *                  -1 if second argument is higher.
 * @deprecated Use goog.string.compareVersions.
 */
goog.userAgent.compare = function(v1, v2) {
  return goog.string.compareVersions(v1, v2);
};


/**
 * Cache for {@link goog.userAgent.isVersion}. Calls to compareVersions are
 * surprisingly expensive and as a browsers version number is unlikely to change
 * during a session we cache the results.
 * @type {Object}
 * @private
 */
goog.userAgent.isVersionCache_ = {};


/**
 * Whether the user agent version is higher or the same as the given version.
 * NOTE: When checking the version numbers for Firefox and Safari, be sure to
 * use the engine's version, not the browser's version number.  For example,
 * Firefox 3.0 corresponds to Gecko 1.9 and Safari 3.0 to Webkit 522.11.
 * Opera and Internet Explorer versions match the product release number.<br>
 * @see <a href="http://en.wikipedia.org/wiki/Safari_version_history">
 *     Webkit</a>
 * @see <a href="http://en.wikipedia.org/wiki/Gecko_engine">Gecko</a>
 *
 * @param {string|number} version The version to check.
 * @return {boolean} Whether the user agent version is higher or the same as
 *     the given version.
 */
goog.userAgent.isVersion = function(version) {
  return goog.userAgent.ASSUME_ANY_VERSION ||
      goog.userAgent.isVersionCache_[version] ||
      (goog.userAgent.isVersionCache_[version] =
          goog.string.compareVersions(goog.userAgent.VERSION, version) >= 0);
};


/**
 * Cache for {@link goog.userAgent.isDocumentMode}.
 * Browsers document mode version number is unlikely to change during a session
 * we cache the results.
 * @type {Object}
 * @private
 */
goog.userAgent.isDocumentModeCache_ = {};


/**
 * Whether the IE effective document mode is higher or the same as the given
 * document mode version.
 * NOTE: Only for IE, return false for another browser.
 *
 * @param {number} documentMode The document mode version to check.
 * @return {boolean} Whether the IE effective document mode is higher or the
 *     same as the given version.
 */
goog.userAgent.isDocumentMode = function(documentMode) {
  return goog.userAgent.isDocumentModeCache_[documentMode] ||
      (goog.userAgent.isDocumentModeCache_[documentMode] = goog.userAgent.IE &&
      !!document.documentMode && document.documentMode >= documentMode);
};
// Copyright 2009 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Provides a base class for custom Error objects such that the
 * stack is correctly maintained.
 *
 * You should never need to throw goog.debug.Error(msg) directly, Error(msg) is
 * sufficient.
 *
 */

goog.provide('goog.debug.Error');



/**
 * Base class for custom error objects.
 * @param {*=} opt_msg The message associated with the error.
 * @constructor
 * @extends {Error}
 */
goog.debug.Error = function(opt_msg) {

  // Ensure there is a stack trace.
  this.stack = new Error().stack || '';

  if (opt_msg) {
    this.message = String(opt_msg);
  }
};
goog.inherits(goog.debug.Error, Error);


/** @override */
goog.debug.Error.prototype.name = 'CustomError';
// Copyright 2008 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities to check the preconditions, postconditions and
 * invariants runtime.
 *
 * Methods in this package should be given special treatment by the compiler
 * for type-inference. For example, <code>goog.asserts.assert(foo)</code>
 * will restrict <code>foo</code> to a truthy value.
 *
 * The compiler has an option to disable asserts. So code like:
 * <code>
 * var x = goog.asserts.assert(foo()); goog.asserts.assert(bar());
 * </code>
 * will be transformed into:
 * <code>
 * var x = foo();
 * </code>
 * The compiler will leave in foo() (because its return value is used),
 * but it will remove bar() because it assumes it does not have side-effects.
 *
 */

goog.provide('goog.asserts');
goog.provide('goog.asserts.AssertionError');

goog.require('goog.debug.Error');
goog.require('goog.string');


/**
 * @define {boolean} Whether to strip out asserts or to leave them in.
 */
goog.asserts.ENABLE_ASSERTS = goog.DEBUG;



/**
 * Error object for failed assertions.
 * @param {string} messagePattern The pattern that was used to form message.
 * @param {!Array.<*>} messageArgs The items to substitute into the pattern.
 * @constructor
 * @extends {goog.debug.Error}
 */
goog.asserts.AssertionError = function(messagePattern, messageArgs) {
  messageArgs.unshift(messagePattern);
  goog.debug.Error.call(this, goog.string.subs.apply(null, messageArgs));
  // Remove the messagePattern afterwards to avoid permenantly modifying the
  // passed in array.
  messageArgs.shift();

  /**
   * The message pattern used to format the error message. Error handlers can
   * use this to uniquely identify the assertion.
   * @type {string}
   */
  this.messagePattern = messagePattern;
};
goog.inherits(goog.asserts.AssertionError, goog.debug.Error);


/** @override */
goog.asserts.AssertionError.prototype.name = 'AssertionError';


/**
 * Throws an exception with the given message and "Assertion failed" prefixed
 * onto it.
 * @param {string} defaultMessage The message to use if givenMessage is empty.
 * @param {Array.<*>} defaultArgs The substitution arguments for defaultMessage.
 * @param {string|undefined} givenMessage Message supplied by the caller.
 * @param {Array.<*>} givenArgs The substitution arguments for givenMessage.
 * @throws {goog.asserts.AssertionError} When the value is not a number.
 * @private
 */
goog.asserts.doAssertFailure_ =
    function(defaultMessage, defaultArgs, givenMessage, givenArgs) {
  var message = 'Assertion failed';
  if (givenMessage) {
    message += ': ' + givenMessage;
    var args = givenArgs;
  } else if (defaultMessage) {
    message += ': ' + defaultMessage;
    args = defaultArgs;
  }
  // The '' + works around an Opera 10 bug in the unit tests. Without it,
  // a stack trace is added to var message above. With this, a stack trace is
  // not added until this line (it causes the extra garbage to be added after
  // the assertion message instead of in the middle of it).
  throw new goog.asserts.AssertionError('' + message, args || []);
};


/**
 * Checks if the condition evaluates to true if goog.asserts.ENABLE_ASSERTS is
 * true.
 * @param {*} condition The condition to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {*} The value of the condition.
 * @throws {goog.asserts.AssertionError} When the condition evaluates to false.
 */
goog.asserts.assert = function(condition, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !condition) {
    goog.asserts.doAssertFailure_('', null, opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return condition;
};


/**
 * Fails if goog.asserts.ENABLE_ASSERTS is true. This function is useful in case
 * when we want to add a check in the unreachable area like switch-case
 * statement:
 *
 * <pre>
 *  switch(type) {
 *    case FOO: doSomething(); break;
 *    case BAR: doSomethingElse(); break;
 *    default: goog.assert.fail('Unrecognized type: ' + type);
 *      // We have only 2 types - "default:" section is unreachable code.
 *  }
 * </pre>
 *
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @throws {goog.asserts.AssertionError} Failure.
 */
goog.asserts.fail = function(opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS) {
    throw new goog.asserts.AssertionError(
        'Failure' + (opt_message ? ': ' + opt_message : ''),
        Array.prototype.slice.call(arguments, 1));
  }
};


/**
 * Checks if the value is a number if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {number} The value, guaranteed to be a number when asserts enabled.
 * @throws {goog.asserts.AssertionError} When the value is not a number.
 */
goog.asserts.assertNumber = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isNumber(value)) {
    goog.asserts.doAssertFailure_('Expected number but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {number} */ (value);
};


/**
 * Checks if the value is a string if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {string} The value, guaranteed to be a string when asserts enabled.
 * @throws {goog.asserts.AssertionError} When the value is not a string.
 */
goog.asserts.assertString = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isString(value)) {
    goog.asserts.doAssertFailure_('Expected string but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {string} */ (value);
};


/**
 * Checks if the value is a function if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {!Function} The value, guaranteed to be a function when asserts
 *     enabled.
 * @throws {goog.asserts.AssertionError} When the value is not a function.
 */
goog.asserts.assertFunction = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isFunction(value)) {
    goog.asserts.doAssertFailure_('Expected function but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {!Function} */ (value);
};


/**
 * Checks if the value is an Object if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {!Object} The value, guaranteed to be a non-null object.
 * @throws {goog.asserts.AssertionError} When the value is not an object.
 */
goog.asserts.assertObject = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isObject(value)) {
    goog.asserts.doAssertFailure_('Expected object but got %s: %s.',
        [goog.typeOf(value), value],
        opt_message, Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {!Object} */ (value);
};


/**
 * Checks if the value is an Array if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {!Array} The value, guaranteed to be a non-null array.
 * @throws {goog.asserts.AssertionError} When the value is not an array.
 */
goog.asserts.assertArray = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isArray(value)) {
    goog.asserts.doAssertFailure_('Expected array but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {!Array} */ (value);
};


/**
 * Checks if the value is a boolean if goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @return {boolean} The value, guaranteed to be a boolean when asserts are
 *     enabled.
 * @throws {goog.asserts.AssertionError} When the value is not a boolean.
 */
goog.asserts.assertBoolean = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isBoolean(value)) {
    goog.asserts.doAssertFailure_('Expected boolean but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return /** @type {boolean} */ (value);
};


/**
 * Checks if the value is an instance of the user-defined type if
 * goog.asserts.ENABLE_ASSERTS is true.
 * @param {*} value The value to check.
 * @param {!Function} type A user-defined constructor.
 * @param {string=} opt_message Error message in case of failure.
 * @param {...*} var_args The items to substitute into the failure message.
 * @throws {goog.asserts.AssertionError} When the value is not an instance of
 *     type.
 */
goog.asserts.assertInstanceof = function(value, type, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !(value instanceof type)) {
    goog.asserts.doAssertFailure_('instanceof check failed.', null,
        opt_message, Array.prototype.slice.call(arguments, 3));
  }
};

// Copyright 2008 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Simple utilities for dealing with URI strings.
 *
 * This is intended to be a lightweight alternative to constructing goog.Uri
 * objects.  Whereas goog.Uri adds several kilobytes to the binary regardless
 * of how much of its functionality you use, this is designed to be a set of
 * mostly-independent utilities so that the compiler includes only what is
 * necessary for the task.  Estimated savings of porting is 5k pre-gzip and
 * 1.5k post-gzip.  To ensure the savings remain, future developers should
 * avoid adding new functionality to existing functions, but instead create
 * new ones and factor out shared code.
 *
 * Many of these utilities have limited functionality, tailored to common
 * cases.  The query parameter utilities assume that the parameter keys are
 * already encoded, since most keys are compile-time alphanumeric strings.  The
 * query parameter mutation utilities also do not tolerate fragment identifiers.
 *
 * By design, these functions can be slower than goog.Uri equivalents.
 * Repeated calls to some of functions may be quadratic in behavior for IE,
 * although the effect is somewhat limited given the 2kb limit.
 *
 * One advantage of the limited functionality here is that this approach is
 * less sensitive to differences in URI encodings than goog.Uri, since these
 * functions modify the strings in place, rather than decoding and
 * re-encoding.
 *
 * Uses features of RFC 3986 for parsing/formatting URIs:
 *   http://gbiv.com/protocols/uri/rfc/rfc3986.html
 *
 * @author gboyer@google.com (Garrett Boyer) - The "lightened" design.
 * @author msamuel@google.com (Mike Samuel) - Domain knowledge and regexes.
 */

goog.provide('goog.uri.utils');
goog.provide('goog.uri.utils.ComponentIndex');
goog.provide('goog.uri.utils.QueryArray');
goog.provide('goog.uri.utils.QueryValue');
goog.provide('goog.uri.utils.StandardQueryParam');

goog.require('goog.asserts');
goog.require('goog.string');
goog.require('goog.userAgent');


/**
 * Character codes inlined to avoid object allocations due to charCode.
 * @enum {number}
 * @private
 */
goog.uri.utils.CharCode_ = {
  AMPERSAND: 38,
  EQUAL: 61,
  HASH: 35,
  QUESTION: 63
};


/**
 * Builds a URI string from already-encoded parts.
 *
 * No encoding is performed.  Any component may be omitted as either null or
 * undefined.
 *
 * @param {?string=} opt_scheme The scheme such as 'http'.
 * @param {?string=} opt_userInfo The user name before the '@'.
 * @param {?string=} opt_domain The domain such as 'www.google.com', already
 *     URI-encoded.
 * @param {(string|number|null)=} opt_port The port number.
 * @param {?string=} opt_path The path, already URI-encoded.  If it is not
 *     empty, it must begin with a slash.
 * @param {?string=} opt_queryData The URI-encoded query data.
 * @param {?string=} opt_fragment The URI-encoded fragment identifier.
 * @return {string} The fully combined URI.
 */
goog.uri.utils.buildFromEncodedParts = function(opt_scheme, opt_userInfo,
    opt_domain, opt_port, opt_path, opt_queryData, opt_fragment) {
  var out = [];

  if (opt_scheme) {
    out.push(opt_scheme, ':');
  }

  if (opt_domain) {
    out.push('//');

    if (opt_userInfo) {
      out.push(opt_userInfo, '@');
    }

    out.push(opt_domain);

    if (opt_port) {
      out.push(':', opt_port);
    }
  }

  if (opt_path) {
    out.push(opt_path);
  }

  if (opt_queryData) {
    out.push('?', opt_queryData);
  }

  if (opt_fragment) {
    out.push('#', opt_fragment);
  }

  return out.join('');
};


/**
 * A regular expression for breaking a URI into its component parts.
 *
 * {@link http://www.gbiv.com/protocols/uri/rfc/rfc3986.html#RFC2234} says
 * As the "first-match-wins" algorithm is identical to the "greedy"
 * disambiguation method used by POSIX regular expressions, it is natural and
 * commonplace to use a regular expression for parsing the potential five
 * components of a URI reference.
 *
 * The following line is the regular expression for breaking-down a
 * well-formed URI reference into its components.
 *
 * <pre>
 * ^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?
 *  12            3  4          5       6  7        8 9
 * </pre>
 *
 * The numbers in the second line above are only to assist readability; they
 * indicate the reference points for each subexpression (i.e., each paired
 * parenthesis). We refer to the value matched for subexpression <n> as $<n>.
 * For example, matching the above expression to
 * <pre>
 *     http://www.ics.uci.edu/pub/ietf/uri/#Related
 * </pre>
 * results in the following subexpression matches:
 * <pre>
 *    $1 = http:
 *    $2 = http
 *    $3 = //www.ics.uci.edu
 *    $4 = www.ics.uci.edu
 *    $5 = /pub/ietf/uri/
 *    $6 = <undefined>
 *    $7 = <undefined>
 *    $8 = #Related
 *    $9 = Related
 * </pre>
 * where <undefined> indicates that the component is not present, as is the
 * case for the query component in the above example. Therefore, we can
 * determine the value of the five components as
 * <pre>
 *    scheme    = $2
 *    authority = $4
 *    path      = $5
 *    query     = $7
 *    fragment  = $9
 * </pre>
 *
 * The regular expression has been modified slightly to expose the
 * userInfo, domain, and port separately from the authority.
 * The modified version yields
 * <pre>
 *    $1 = http              scheme
 *    $2 = <undefined>       userInfo -\
 *    $3 = www.ics.uci.edu   domain     | authority
 *    $4 = <undefined>       port     -/
 *    $5 = /pub/ietf/uri/    path
 *    $6 = <undefined>       query without ?
 *    $7 = Related           fragment without #
 * </pre>
 * @type {!RegExp}
 * @private
 */
goog.uri.utils.splitRe_ = new RegExp(
    '^' +
    '(?:' +
      '([^:/?#.]+)' +                     // scheme - ignore special characters
                                          // used by other URL parts such as :,
                                          // ?, /, #, and .
    ':)?' +
    '(?://' +
      '(?:([^/?#]*)@)?' +                 // userInfo
      '([\\w\\d\\-\\u0100-\\uffff.%]*)' + // domain - restrict to letters,
                                          // digits, dashes, dots, percent
                                          // escapes, and unicode characters.
      '(?::([0-9]+))?' +                  // port
    ')?' +
    '([^?#]+)?' +                         // path
    '(?:\\?([^#]*))?' +                   // query
    '(?:#(.*))?' +                        // fragment
    '$');


/**
 * The index of each URI component in the return value of goog.uri.utils.split.
 * @enum {number}
 */
goog.uri.utils.ComponentIndex = {
  SCHEME: 1,
  USER_INFO: 2,
  DOMAIN: 3,
  PORT: 4,
  PATH: 5,
  QUERY_DATA: 6,
  FRAGMENT: 7
};


/**
 * Splits a URI into its component parts.
 *
 * Each component can be accessed via the component indices; for example:
 * <pre>
 * goog.uri.utils.split(someStr)[goog.uri.utils.CompontentIndex.QUERY_DATA];
 * </pre>
 *
 * @param {string} uri The URI string to examine.
 * @return {!Array.<string|undefined>} Each component still URI-encoded.
 *     Each component that is present will contain the encoded value, whereas
 *     components that are not present will be undefined or empty, depending
 *     on the browser's regular expression implementation.  Never null, since
 *     arbitrary strings may still look like path names.
 */
goog.uri.utils.split = function(uri) {

  // See @return comment -- never null.
  return /** @type {!Array.<string|undefined>} */ (
      uri.match(goog.uri.utils.splitRe_));
};




/**
 * @param {?string} uri A possibly null string.
 * @return {?string} The string URI-decoded, or null if uri is null.
 * @private
 */
goog.uri.utils.decodeIfPossible_ = function(uri) {
  return uri && decodeURIComponent(uri);
};


/**
 * Gets a URI component by index.
 *
 * It is preferred to use the getPathEncoded() variety of functions ahead,
 * since they are more readable.
 *
 * @param {goog.uri.utils.ComponentIndex} componentIndex The component index.
 * @param {string} uri The URI to examine.
 * @return {?string} The still-encoded component, or null if the component
 *     is not present.
 * @private
 */
goog.uri.utils.getComponentByIndex_ = function(componentIndex, uri) {
  // Convert undefined, null, and empty string into null.
  return goog.uri.utils.split(uri)[componentIndex] || null;
};


/**
 * @param {string} uri The URI to examine.
 * @return {?string} The protocol or scheme, or null if none.  Does not
 *     include trailing colons or slashes.
 */
goog.uri.utils.getScheme = function(uri) {
  return goog.uri.utils.getComponentByIndex_(
      goog.uri.utils.ComponentIndex.SCHEME, uri);
};


/**
 * Gets the effective scheme for the URL.  If the URL is relative then the
 * scheme is derived from the page's location.
 * @param {string} uri The URI to examine.
 * @return {string} The protocol or scheme, always lower case.
 */
goog.uri.utils.getEffectiveScheme = function(uri) {
  var scheme = goog.uri.utils.getScheme(uri);
  if (!scheme && self.location) {
    var protocol = self.location.protocol;
    scheme = protocol.substr(0, protocol.length - 1);
  }
  // NOTE: When called from a web worker in Firefox 3.5, location maybe null.
  // All other browsers with web workers support self.location from the worker.
  return scheme ? scheme.toLowerCase() : '';
};


/**
 * @param {string} uri The URI to examine.
 * @return {?string} The user name still encoded, or null if none.
 */
goog.uri.utils.getUserInfoEncoded = function(uri) {
  return goog.uri.utils.getComponentByIndex_(
      goog.uri.utils.ComponentIndex.USER_INFO, uri);
};


/**
 * @param {string} uri The URI to examine.
 * @return {?string} The decoded user info, or null if none.
 */
goog.uri.utils.getUserInfo = function(uri) {
  return goog.uri.utils.decodeIfPossible_(
      goog.uri.utils.getUserInfoEncoded(uri));
};


/**
 * @param {string} uri The URI to examine.
 * @return {?string} The domain name still encoded, or null if none.
 */
goog.uri.utils.getDomainEncoded = function(uri) {
  return goog.uri.utils.getComponentByIndex_(
      goog.uri.utils.ComponentIndex.DOMAIN, uri);
};


/**
 * @param {string} uri The URI to examine.
 * @return {?string} The decoded domain, or null if none.
 */
goog.uri.utils.getDomain = function(uri) {
  return goog.uri.utils.decodeIfPossible_(goog.uri.utils.getDomainEncoded(uri));
};


/**
 * @param {string} uri The URI to examine.
 * @return {?number} The port number, or null if none.
 */
goog.uri.utils.getPort = function(uri) {
  // Coerce to a number.  If the result of getComponentByIndex_ is null or
  // non-numeric, the number coersion yields NaN.  This will then return
  // null for all non-numeric cases (though also zero, which isn't a relevant
  // port number).
  return Number(goog.uri.utils.getComponentByIndex_(
      goog.uri.utils.ComponentIndex.PORT, uri)) || null;
};


/**
 * @param {string} uri The URI to examine.
 * @return {?string} The path still encoded, or null if none. Includes the
 *     leading slash, if any.
 */
goog.uri.utils.getPathEncoded = function(uri) {
  return goog.uri.utils.getComponentByIndex_(
      goog.uri.utils.ComponentIndex.PATH, uri);
};


/**
 * @param {string} uri The URI to examine.
 * @return {?string} The decoded path, or null if none.  Includes the leading
 *     slash, if any.
 */
goog.uri.utils.getPath = function(uri) {
  return goog.uri.utils.decodeIfPossible_(goog.uri.utils.getPathEncoded(uri));
};


/**
 * @param {string} uri The URI to examine.
 * @return {?string} The query data still encoded, or null if none.  Does not
 *     include the question mark itself.
 */
goog.uri.utils.getQueryData = function(uri) {
  return goog.uri.utils.getComponentByIndex_(
      goog.uri.utils.ComponentIndex.QUERY_DATA, uri);
};


/**
 * @param {string} uri The URI to examine.
 * @return {?string} The fragment identifier, or null if none.  Does not
 *     include the hash mark itself.
 */
goog.uri.utils.getFragmentEncoded = function(uri) {
  // The hash mark may not appear in any other part of the URL.
  var hashIndex = uri.indexOf('#');
  return hashIndex < 0 ? null : uri.substr(hashIndex + 1);
};


/**
 * @param {string} uri The URI to examine.
 * @param {?string} fragment The encoded fragment identifier, or null if none.
 *     Does not include the hash mark itself.
 * @return {string} The URI with the fragment set.
 */
goog.uri.utils.setFragmentEncoded = function(uri, fragment) {
  return goog.uri.utils.removeFragment(uri) + (fragment ? '#' + fragment : '');
};


/**
 * @param {string} uri The URI to examine.
 * @return {?string} The decoded fragment identifier, or null if none.  Does
 *     not include the hash mark.
 */
goog.uri.utils.getFragment = function(uri) {
  return goog.uri.utils.decodeIfPossible_(
      goog.uri.utils.getFragmentEncoded(uri));
};


/**
 * Extracts everything up to the port of the URI.
 * @param {string} uri The URI string.
 * @return {string} Everything up to and including the port.
 */
goog.uri.utils.getHost = function(uri) {
  var pieces = goog.uri.utils.split(uri);
  return goog.uri.utils.buildFromEncodedParts(
      pieces[goog.uri.utils.ComponentIndex.SCHEME],
      pieces[goog.uri.utils.ComponentIndex.USER_INFO],
      pieces[goog.uri.utils.ComponentIndex.DOMAIN],
      pieces[goog.uri.utils.ComponentIndex.PORT]);
};


/**
 * Extracts the path of the URL and everything after.
 * @param {string} uri The URI string.
 * @return {string} The URI, starting at the path and including the query
 *     parameters and fragment identifier.
 */
goog.uri.utils.getPathAndAfter = function(uri) {
  var pieces = goog.uri.utils.split(uri);
  return goog.uri.utils.buildFromEncodedParts(null, null, null, null,
      pieces[goog.uri.utils.ComponentIndex.PATH],
      pieces[goog.uri.utils.ComponentIndex.QUERY_DATA],
      pieces[goog.uri.utils.ComponentIndex.FRAGMENT]);
};


/**
 * Gets the URI with the fragment identifier removed.
 * @param {string} uri The URI to examine.
 * @return {string} Everything preceding the hash mark.
 */
goog.uri.utils.removeFragment = function(uri) {
  // The hash mark may not appear in any other part of the URL.
  var hashIndex = uri.indexOf('#');
  return hashIndex < 0 ? uri : uri.substr(0, hashIndex);
};


/**
 * Ensures that two URI's have the exact same domain, scheme, and port.
 *
 * Unlike the version in goog.Uri, this checks protocol, and therefore is
 * suitable for checking against the browser's same-origin policy.
 *
 * @param {string} uri1 The first URI.
 * @param {string} uri2 The second URI.
 * @return {boolean} Whether they have the same domain and port.
 */
goog.uri.utils.haveSameDomain = function(uri1, uri2) {
  var pieces1 = goog.uri.utils.split(uri1);
  var pieces2 = goog.uri.utils.split(uri2);
  return pieces1[goog.uri.utils.ComponentIndex.DOMAIN] ==
             pieces2[goog.uri.utils.ComponentIndex.DOMAIN] &&
         pieces1[goog.uri.utils.ComponentIndex.SCHEME] ==
             pieces2[goog.uri.utils.ComponentIndex.SCHEME] &&
         pieces1[goog.uri.utils.ComponentIndex.PORT] ==
             pieces2[goog.uri.utils.ComponentIndex.PORT];
};


/**
 * Asserts that there are no fragment or query identifiers, only in uncompiled
 * mode.
 * @param {string} uri The URI to examine.
 * @private
 */
goog.uri.utils.assertNoFragmentsOrQueries_ = function(uri) {
  // NOTE: would use goog.asserts here, but jscompiler doesn't know that
  // indexOf has no side effects.
  if (goog.DEBUG && (uri.indexOf('#') >= 0 || uri.indexOf('?') >= 0)) {
    throw Error('goog.uri.utils: Fragment or query identifiers are not ' +
        'supported: [' + uri + ']');
  }
};


/**
 * Supported query parameter values by the parameter serializing utilities.
 *
 * If a value is null or undefined, the key-value pair is skipped, as an easy
 * way to omit parameters conditionally.  Non-array parameters are converted
 * to a string and URI encoded.  Array values are expanded into multiple
 * &key=value pairs, with each element stringized and URI-encoded.
 *
 * @typedef {*}
 */
goog.uri.utils.QueryValue;


/**
 * An array representing a set of query parameters with alternating keys
 * and values.
 *
 * Keys are assumed to be URI encoded already and live at even indices.  See
 * goog.uri.utils.QueryValue for details on how parameter values are encoded.
 *
 * Example:
 * <pre>
 * var data = [
 *   // Simple param: ?name=BobBarker
 *   'name', 'BobBarker',
 *   // Conditional param -- may be omitted entirely.
 *   'specialDietaryNeeds', hasDietaryNeeds() ? getDietaryNeeds() : null,
 *   // Multi-valued param: &house=LosAngeles&house=NewYork&house=null
 *   'house', ['LosAngeles', 'NewYork', null]
 * ];
 * </pre>
 *
 * @typedef {!Array.<string|goog.uri.utils.QueryValue>}
 */
goog.uri.utils.QueryArray;


/**
 * Appends a URI and query data in a string buffer with special preconditions.
 *
 * Internal implementation utility, performing very few object allocations.
 *
 * @param {!Array.<string|undefined>} buffer A string buffer.  The first element
 *     must be the base URI, and may have a fragment identifier.  If the array
 *     contains more than one element, the second element must be an ampersand,
 *     and may be overwritten, depending on the base URI.  Undefined elements
 *     are treated as empty-string.
 * @return {string} The concatenated URI and query data.
 * @private
 */
goog.uri.utils.appendQueryData_ = function(buffer) {
  if (buffer[1]) {
    // At least one query parameter was added.  We need to check the
    // punctuation mark, which is currently an ampersand, and also make sure
    // there aren't any interfering fragment identifiers.
    var baseUri = /** @type {string} */ (buffer[0]);
    var hashIndex = baseUri.indexOf('#');
    if (hashIndex >= 0) {
      // Move the fragment off the base part of the URI into the end.
      buffer.push(baseUri.substr(hashIndex));
      buffer[0] = baseUri = baseUri.substr(0, hashIndex);
    }
    var questionIndex = baseUri.indexOf('?');
    if (questionIndex < 0) {
      // No question mark, so we need a question mark instead of an ampersand.
      buffer[1] = '?';
    } else if (questionIndex == baseUri.length - 1) {
      // Question mark is the very last character of the existing URI, so don't
      // append an additional delimiter.
      buffer[1] = undefined;
    }
  }

  return buffer.join('');
};


/**
 * Appends key=value pairs to an array, supporting multi-valued objects.
 * @param {string} key The key prefix.
 * @param {goog.uri.utils.QueryValue} value The value to serialize.
 * @param {!Array.<string>} pairs The array to which the 'key=value' strings
 *     should be appended.
 * @private
 */
goog.uri.utils.appendKeyValuePairs_ = function(key, value, pairs) {
  if (goog.isArray(value)) {
    // It's an array, so append all elements.  Here, we must convince
    // jscompiler that it is, indeed, an array.
    value = /** @type {Array} */ (value);
    for (var j = 0; j < value.length; j++) {
      pairs.push('&', key);
      // Check for empty string, null and undefined get encoded
      // into the url as literal strings
      if (value[j] !== '') {
        pairs.push('=', goog.string.urlEncode(value[j]));
      }
    }
  } else if (value != null) {
    // Not null or undefined, so safe to append.
    pairs.push('&', key);
    // Check for empty string, null and undefined get encoded
    // into the url as literal strings
    if (value !== '') {
      pairs.push('=', goog.string.urlEncode(value));
    }
  }
};


/**
 * Builds a buffer of query data from a sequence of alternating keys and values.
 *
 * @param {!Array.<string|undefined>} buffer A string buffer to append to.  The
 *     first element appended will be an '&', and may be replaced by the caller.
 * @param {goog.uri.utils.QueryArray|Arguments} keysAndValues An array with
 *     alternating keys and values -- see the typedef.
 * @param {number=} opt_startIndex A start offset into the arary, defaults to 0.
 * @return {!Array.<string|undefined>} The buffer argument.
 * @private
 */
goog.uri.utils.buildQueryDataBuffer_ = function(
    buffer, keysAndValues, opt_startIndex) {
  goog.asserts.assert(Math.max(keysAndValues.length - (opt_startIndex || 0),
      0) % 2 == 0, 'goog.uri.utils: Key/value lists must be even in length.');

  for (var i = opt_startIndex || 0; i < keysAndValues.length; i += 2) {
    goog.uri.utils.appendKeyValuePairs_(
        keysAndValues[i], keysAndValues[i + 1], buffer);
  }

  return buffer;
};


/**
 * Builds a query data string from a sequence of alternating keys and values.
 * Currently generates "&key&" for empty args.
 *
 * @param {goog.uri.utils.QueryArray} keysAndValues Alternating keys and
 *     values.  See the typedef.
 * @param {number=} opt_startIndex A start offset into the arary, defaults to 0.
 * @return {string} The encoded query string, in the for 'a=1&b=2'.
 */
goog.uri.utils.buildQueryData = function(keysAndValues, opt_startIndex) {
  var buffer = goog.uri.utils.buildQueryDataBuffer_(
      [], keysAndValues, opt_startIndex);
  buffer[0] = ''; // Remove the leading ampersand.
  return buffer.join('');
};


/**
 * Builds a buffer of query data from a map.
 *
 * @param {!Array.<string|undefined>} buffer A string buffer to append to.  The
 *     first element appended will be an '&', and may be replaced by the caller.
 * @param {Object.<goog.uri.utils.QueryValue>} map An object where keys are
 *     URI-encoded parameter keys, and the values conform to the contract
 *     specified in the goog.uri.utils.QueryValue typedef.
 * @return {!Array.<string|undefined>} The buffer argument.
 * @private
 */
goog.uri.utils.buildQueryDataBufferFromMap_ = function(buffer, map) {
  for (var key in map) {
    goog.uri.utils.appendKeyValuePairs_(key, map[key], buffer);
  }

  return buffer;
};


/**
 * Builds a query data string from a map.
 * Currently generates "&key&" for empty args.
 *
 * @param {Object} map An object where keys are URI-encoded parameter keys,
 *     and the values are arbitrary types or arrays.  Keys with a null value
 *     are dropped.
 * @return {string} The encoded query string, in the for 'a=1&b=2'.
 */
goog.uri.utils.buildQueryDataFromMap = function(map) {
  var buffer = goog.uri.utils.buildQueryDataBufferFromMap_([], map);
  buffer[0] = '';
  return buffer.join('');
};


/**
 * Appends URI parameters to an existing URI.
 *
 * The variable arguments may contain alternating keys and values.  Keys are
 * assumed to be already URI encoded.  The values should not be URI-encoded,
 * and will instead be encoded by this function.
 * <pre>
 * appendParams('http://www.foo.com?existing=true',
 *     'key1', 'value1',
 *     'key2', 'value?willBeEncoded',
 *     'key3', ['valueA', 'valueB', 'valueC'],
 *     'key4', null);
 * result: 'http://www.foo.com?existing=true&' +
 *     'key1=value1&' +
 *     'key2=value%3FwillBeEncoded&' +
 *     'key3=valueA&key3=valueB&key3=valueC'
 * </pre>
 *
 * A single call to this function will not exhibit quadratic behavior in IE,
 * whereas multiple repeated calls may, although the effect is limited by
 * fact that URL's generally can't exceed 2kb.
 *
 * @param {string} uri The original URI, which may already have query data.
 * @param {...(goog.uri.utils.QueryArray|string|goog.uri.utils.QueryValue)} var_args
 *     An array or argument list conforming to goog.uri.utils.QueryArray.
 * @return {string} The URI with all query parameters added.
 */
goog.uri.utils.appendParams = function(uri, var_args) {
  return goog.uri.utils.appendQueryData_(
      arguments.length == 2 ?
      goog.uri.utils.buildQueryDataBuffer_([uri], arguments[1], 0) :
      goog.uri.utils.buildQueryDataBuffer_([uri], arguments, 1));
};


/**
 * Appends query parameters from a map.
 *
 * @param {string} uri The original URI, which may already have query data.
 * @param {Object} map An object where keys are URI-encoded parameter keys,
 *     and the values are arbitrary types or arrays.  Keys with a null value
 *     are dropped.
 * @return {string} The new parameters.
 */
goog.uri.utils.appendParamsFromMap = function(uri, map) {
  return goog.uri.utils.appendQueryData_(
      goog.uri.utils.buildQueryDataBufferFromMap_([uri], map));
};


/**
 * Appends a single URI parameter.
 *
 * Repeated calls to this can exhibit quadratic behavior in IE6 due to the
 * way string append works, though it should be limited given the 2kb limit.
 *
 * @param {string} uri The original URI, which may already have query data.
 * @param {string} key The key, which must already be URI encoded.
 * @param {*} value The value, which will be stringized and encoded (assumed
 *     not already to be encoded).
 * @return {string} The URI with the query parameter added.
 */
goog.uri.utils.appendParam = function(uri, key, value) {
  return goog.uri.utils.appendQueryData_(
      [uri, '&', key, '=', goog.string.urlEncode(value)]);
};


/**
 * Finds the next instance of a query parameter with the specified name.
 *
 * Does not instantiate any objects.
 *
 * @param {string} uri The URI to search.  May contain a fragment identifier
 *     if opt_hashIndex is specified.
 * @param {number} startIndex The index to begin searching for the key at.  A
 *     match may be found even if this is one character after the ampersand.
 * @param {string} keyEncoded The URI-encoded key.
 * @param {number} hashOrEndIndex Index to stop looking at.  If a hash
 *     mark is present, it should be its index, otherwise it should be the
 *     length of the string.
 * @return {number} The position of the first character in the key's name,
 *     immediately after either a question mark or a dot.
 * @private
 */
goog.uri.utils.findParam_ = function(
    uri, startIndex, keyEncoded, hashOrEndIndex) {
  var index = startIndex;
  var keyLength = keyEncoded.length;

  // Search for the key itself and post-filter for surronuding punctuation,
  // rather than expensively building a regexp.
  while ((index = uri.indexOf(keyEncoded, index)) >= 0 &&
      index < hashOrEndIndex) {
    var precedingChar = uri.charCodeAt(index - 1);
    // Ensure that the preceding character is '&' or '?'.
    if (precedingChar == goog.uri.utils.CharCode_.AMPERSAND ||
        precedingChar == goog.uri.utils.CharCode_.QUESTION) {
      // Ensure the following character is '&', '=', '#', or NaN
      // (end of string).
      var followingChar = uri.charCodeAt(index + keyLength);
      if (!followingChar ||
          followingChar == goog.uri.utils.CharCode_.EQUAL ||
          followingChar == goog.uri.utils.CharCode_.AMPERSAND ||
          followingChar == goog.uri.utils.CharCode_.HASH) {
        return index;
      }
    }
    index += keyLength + 1;
  }

  return -1;
};


/**
 * Regular expression for finding a hash mark or end of string.
 * @type {RegExp}
 * @private
 */
goog.uri.utils.hashOrEndRe_ = /#|$/;


/**
 * Determines if the URI contains a specific key.
 *
 * Performs no object instantiations.
 *
 * @param {string} uri The URI to process.  May contain a fragment
 *     identifier.
 * @param {string} keyEncoded The URI-encoded key.  Case-sensitive.
 * @return {boolean} Whether the key is present.
 */
goog.uri.utils.hasParam = function(uri, keyEncoded) {
  return goog.uri.utils.findParam_(uri, 0, keyEncoded,
      uri.search(goog.uri.utils.hashOrEndRe_)) >= 0;
};


/**
 * Gets the first value of a query parameter.
 * @param {string} uri The URI to process.  May contain a fragment.
 * @param {string} keyEncoded The URI-encoded key.  Case-sensitive.
 * @return {?string} The first value of the parameter (URI-decoded), or null
 *     if the parameter is not found.
 */
goog.uri.utils.getParamValue = function(uri, keyEncoded) {
  var hashOrEndIndex = uri.search(goog.uri.utils.hashOrEndRe_);
  var foundIndex = goog.uri.utils.findParam_(
      uri, 0, keyEncoded, hashOrEndIndex);

  if (foundIndex < 0) {
    return null;
  } else {
    var endPosition = uri.indexOf('&', foundIndex);
    if (endPosition < 0 || endPosition > hashOrEndIndex) {
      endPosition = hashOrEndIndex;
    }
    // Progress forth to the end of the "key=" or "key&" substring.
    foundIndex += keyEncoded.length + 1;
    // Use substr, because it (unlike substring) will return empty string
    // if foundIndex > endPosition.
    return goog.string.urlDecode(
        uri.substr(foundIndex, endPosition - foundIndex));
  }
};


/**
 * Gets all values of a query parameter.
 * @param {string} uri The URI to process.  May contain a framgnet.
 * @param {string} keyEncoded The URI-encoded key.  Case-snsitive.
 * @return {!Array.<string>} All URI-decoded values with the given key.
 *     If the key is not found, this will have length 0, but never be null.
 */
goog.uri.utils.getParamValues = function(uri, keyEncoded) {
  var hashOrEndIndex = uri.search(goog.uri.utils.hashOrEndRe_);
  var position = 0;
  var foundIndex;
  var result = [];

  while ((foundIndex = goog.uri.utils.findParam_(
      uri, position, keyEncoded, hashOrEndIndex)) >= 0) {
    // Find where this parameter ends, either the '&' or the end of the
    // query parameters.
    position = uri.indexOf('&', foundIndex);
    if (position < 0 || position > hashOrEndIndex) {
      position = hashOrEndIndex;
    }

    // Progress forth to the end of the "key=" or "key&" substring.
    foundIndex += keyEncoded.length + 1;
    // Use substr, because it (unlike substring) will return empty string
    // if foundIndex > position.
    result.push(goog.string.urlDecode(uri.substr(
        foundIndex, position - foundIndex)));
  }

  return result;
};


/**
 * Regexp to find trailing question marks and ampersands.
 * @type {RegExp}
 * @private
 */
goog.uri.utils.trailingQueryPunctuationRe_ = /[?&]($|#)/;


/**
 * Removes all instances of a query parameter.
 * @param {string} uri The URI to process.  Must not contain a fragment.
 * @param {string} keyEncoded The URI-encoded key.
 * @return {string} The URI with all instances of the parameter removed.
 */
goog.uri.utils.removeParam = function(uri, keyEncoded) {
  var hashOrEndIndex = uri.search(goog.uri.utils.hashOrEndRe_);
  var position = 0;
  var foundIndex;
  var buffer = [];

  // Look for a query parameter.
  while ((foundIndex = goog.uri.utils.findParam_(
      uri, position, keyEncoded, hashOrEndIndex)) >= 0) {
    // Get the portion of the query string up to, but not including, the ?
    // or & starting the parameter.
    buffer.push(uri.substring(position, foundIndex));
    // Progress to immediately after the '&'.  If not found, go to the end.
    // Avoid including the hash mark.
    position = Math.min((uri.indexOf('&', foundIndex) + 1) || hashOrEndIndex,
        hashOrEndIndex);
  }

  // Append everything that is remaining.
  buffer.push(uri.substr(position));

  // Join the buffer, and remove trailing punctuation that remains.
  return buffer.join('').replace(
      goog.uri.utils.trailingQueryPunctuationRe_, '$1');
};


/**
 * Replaces all existing definitions of a parameter with a single definition.
 *
 * Repeated calls to this can exhibit quadratic behavior due to the need to
 * find existing instances and reconstruct the string, though it should be
 * limited given the 2kb limit.  Consider using appendParams to append multiple
 * parameters in bulk.
 *
 * @param {string} uri The original URI, which may already have query data.
 * @param {string} keyEncoded The key, which must already be URI encoded.
 * @param {*} value The value, which will be stringized and encoded (assumed
 *     not already to be encoded).
 * @return {string} The URI with the query parameter added.
 */
goog.uri.utils.setParam = function(uri, keyEncoded, value) {
  return goog.uri.utils.appendParam(
      goog.uri.utils.removeParam(uri, keyEncoded), keyEncoded, value);
};


/**
 * Generates a URI path using a given URI and a path with checks to
 * prevent consecutive "//". The baseUri passed in must not contain
 * query or fragment identifiers. The path to append may not contain query or
 * fragment identifiers.
 *
 * @param {string} baseUri URI to use as the base.
 * @param {string} path Path to append.
 * @return {string} Updated URI.
 */
goog.uri.utils.appendPath = function(baseUri, path) {
  goog.uri.utils.assertNoFragmentsOrQueries_(baseUri);

  // Remove any trailing '/'
  if (goog.string.endsWith(baseUri, '/')) {
    baseUri = baseUri.substr(0, baseUri.length - 1);
  }
  // Remove any leading '/'
  if (goog.string.startsWith(path, '/')) {
    path = path.substr(1);
  }
  return goog.string.buildString(baseUri, '/', path);
};


/**
 * Standard supported query parameters.
 * @enum {string}
 */
goog.uri.utils.StandardQueryParam = {

  /** Unused parameter for unique-ifying. */
  RANDOM: 'zx'
};


/**
 * Sets the zx parameter of a URI to a random value.
 * @param {string} uri Any URI.
 * @return {string} That URI with the "zx" parameter added or replaced to
 *     contain a random string.
 */
goog.uri.utils.makeUnique = function(uri) {
  return goog.uri.utils.setParam(uri,
      goog.uri.utils.StandardQueryParam.RANDOM, goog.string.getRandomString());
};
// Copyright 2008 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview File which defines dummy object to work around undefined
 * properties compiler warning for weak dependencies on
 * {@link goog.debug.ErrorHandler#protectEntryPoint}.
 *
 */

goog.provide('goog.debug.errorHandlerWeakDep');


/**
 * Dummy object to work around undefined properties compiler warning.
 * @type {Object}
 */
goog.debug.errorHandlerWeakDep = {
  /**
   * @param {Function} fn An entry point function to be protected.
   * @param {boolean=} opt_tracers Whether to install tracers around the
   *     fn.
   * @return {Function} A protected wrapper function that calls the
   *     entry point function.
   */
  protectEntryPoint: function(fn, opt_tracers) { return fn; }
};
// Copyright 2005 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Listener object.
 * @see ../demos/events.html
 */


/**
 * Namespace for events
 */
goog.provide('goog.events.Listener');



/**
 * Simple class that stores information about a listener
 * @constructor
 */
goog.events.Listener = function() {
};


/**
 * Counter used to create a unique key
 * @type {number}
 * @private
 */
goog.events.Listener.counter_ = 0;


/**
 * Whether the listener is a function or an object that implements handleEvent.
 * @type {boolean}
 * @private
 */
goog.events.Listener.prototype.isFunctionListener_;


/**
 * Call back function or an object with a handleEvent function.
 * @type {Function|Object|null}
 */
goog.events.Listener.prototype.listener;


/**
 * Proxy for callback that passes through {@link goog.events#HandleEvent_}
 * @type {Function}
 */
goog.events.Listener.prototype.proxy;


/**
 * Object or node that callback is listening to
 * @type {Object|goog.events.EventTarget}
 */
goog.events.Listener.prototype.src;


/**
 * Type of event
 * @type {string}
 */
goog.events.Listener.prototype.type;


/**
 * Whether the listener is being called in the capture or bubble phase
 * @type {boolean}
 */
goog.events.Listener.prototype.capture;


/**
 * Optional object whose context to execute the listener in
 * @type {Object|undefined}
 */
goog.events.Listener.prototype.handler;


/**
 * The key of the listener.
 * @type {number}
 */
goog.events.Listener.prototype.key = 0;


/**
 * Whether the listener has been removed.
 * @type {boolean}
 */
goog.events.Listener.prototype.removed = false;


/**
 * Whether to remove the listener after it has been called.
 * @type {boolean}
 */
goog.events.Listener.prototype.callOnce = false;


/**
 * Initializes the listener.
 * @param {Function|Object} listener Callback function, or an object with a
 *     handleEvent function.
 * @param {Function} proxy Wrapper for the listener that patches the event.
 * @param {Object} src Source object for the event.
 * @param {string} type Event type.
 * @param {boolean} capture Whether in capture or bubble phase.
 * @param {Object=} opt_handler Object in whose context to execute the callback.
 */
goog.events.Listener.prototype.init = function(listener, proxy, src, type,
                                               capture, opt_handler) {
  // we do the test of the listener here so that we do  not need to
  // continiously do this inside handleEvent
  if (goog.isFunction(listener)) {
    this.isFunctionListener_ = true;
  } else if (listener && listener.handleEvent &&
      goog.isFunction(listener.handleEvent)) {
    this.isFunctionListener_ = false;
  } else {
    throw Error('Invalid listener argument');
  }

  this.listener = listener;
  this.proxy = proxy;
  this.src = src;
  this.type = type;
  this.capture = !!capture;
  this.handler = opt_handler;
  this.callOnce = false;
  this.key = ++goog.events.Listener.counter_;
  this.removed = false;
};


/**
 * Calls the internal listener
 * @param {Object} eventObject Event object to be passed to listener.
 * @return {boolean} The result of the internal listener call.
 */
goog.events.Listener.prototype.handleEvent = function(eventObject) {
  if (this.isFunctionListener_) {
    return this.listener.call(this.handler || this.src, eventObject);
  }
  return this.listener.handleEvent.call(this.listener, eventObject);
};
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities for manipulating objects/maps/hashes.
 */

goog.provide('goog.object');


/**
 * Calls a function for each element in an object/map/hash.
 *
 * @param {Object} obj The object over which to iterate.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the object)
 *     and the return value is irrelevant.
 * @param {Object=} opt_obj This is used as the 'this' object within f.
 */
goog.object.forEach = function(obj, f, opt_obj) {
  for (var key in obj) {
    f.call(opt_obj, obj[key], key, obj);
  }
};


/**
 * Calls a function for each element in an object/map/hash. If that call returns
 * true, adds the element to a new object.
 *
 * @param {Object} obj The object over which to iterate.
 * @param {Function} f The function to call for every element. This
 *     function takes 3 arguments (the element, the index and the object)
 *     and should return a boolean. If the return value is true the
 *     element is added to the result object. If it is false the
 *     element is not included.
 * @param {Object=} opt_obj This is used as the 'this' object within f.
 * @return {!Object} a new object in which only elements that passed the test
 *     are present.
 */
goog.object.filter = function(obj, f, opt_obj) {
  var res = {};
  for (var key in obj) {
    if (f.call(opt_obj, obj[key], key, obj)) {
      res[key] = obj[key];
    }
  }
  return res;
};


/**
 * For every element in an object/map/hash calls a function and inserts the
 * result into a new object.
 *
 * @param {Object} obj The object over which to iterate.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the object)
 *     and should return something. The result will be inserted
 *     into a new object.
 * @param {Object=} opt_obj This is used as the 'this' object within f.
 * @return {!Object} a new object with the results from f.
 */
goog.object.map = function(obj, f, opt_obj) {
  var res = {};
  for (var key in obj) {
    res[key] = f.call(opt_obj, obj[key], key, obj);
  }
  return res;
};


/**
 * Calls a function for each element in an object/map/hash. If any
 * call returns true, returns true (without checking the rest). If
 * all calls return false, returns false.
 *
 * @param {Object} obj The object to check.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the object) and should
 *     return a boolean.
 * @param {Object=} opt_obj This is used as the 'this' object within f.
 * @return {boolean} true if any element passes the test.
 */
goog.object.some = function(obj, f, opt_obj) {
  for (var key in obj) {
    if (f.call(opt_obj, obj[key], key, obj)) {
      return true;
    }
  }
  return false;
};


/**
 * Calls a function for each element in an object/map/hash. If
 * all calls return true, returns true. If any call returns false, returns
 * false at this point and does not continue to check the remaining elements.
 *
 * @param {Object} obj The object to check.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the object) and should
 *     return a boolean.
 * @param {Object=} opt_obj This is used as the 'this' object within f.
 * @return {boolean} false if any element fails the test.
 */
goog.object.every = function(obj, f, opt_obj) {
  for (var key in obj) {
    if (!f.call(opt_obj, obj[key], key, obj)) {
      return false;
    }
  }
  return true;
};


/**
 * Returns the number of key-value pairs in the object map.
 *
 * @param {Object} obj The object for which to get the number of key-value
 *     pairs.
 * @return {number} The number of key-value pairs in the object map.
 */
goog.object.getCount = function(obj) {
  // JS1.5 has __count__ but it has been deprecated so it raises a warning...
  // in other words do not use. Also __count__ only includes the fields on the
  // actual object and not in the prototype chain.
  var rv = 0;
  for (var key in obj) {
    rv++;
  }
  return rv;
};


/**
 * Returns one key from the object map, if any exists.
 * For map literals the returned key will be the first one in most of the
 * browsers (a know exception is Konqueror).
 *
 * @param {Object} obj The object to pick a key from.
 * @return {string|undefined} The key or undefined if the object is empty.
 */
goog.object.getAnyKey = function(obj) {
  for (var key in obj) {
    return key;
  }
};


/**
 * Returns one value from the object map, if any exists.
 * For map literals the returned value will be the first one in most of the
 * browsers (a know exception is Konqueror).
 *
 * @param {Object} obj The object to pick a value from.
 * @return {*} The value or undefined if the object is empty.
 */
goog.object.getAnyValue = function(obj) {
  for (var key in obj) {
    return obj[key];
  }
};


/**
 * Whether the object/hash/map contains the given object as a value.
 * An alias for goog.object.containsValue(obj, val).
 *
 * @param {Object} obj The object in which to look for val.
 * @param {*} val The object for which to check.
 * @return {boolean} true if val is present.
 */
goog.object.contains = function(obj, val) {
  return goog.object.containsValue(obj, val);
};


/**
 * Returns the values of the object/map/hash.
 *
 * @param {Object} obj The object from which to get the values.
 * @return {!Array} The values in the object/map/hash.
 */
goog.object.getValues = function(obj) {
  var res = [];
  var i = 0;
  for (var key in obj) {
    res[i++] = obj[key];
  }
  return res;
};


/**
 * Returns the keys of the object/map/hash.
 *
 * @param {Object} obj The object from which to get the keys.
 * @return {!Array.<string>} Array of property keys.
 */
goog.object.getKeys = function(obj) {
  var res = [];
  var i = 0;
  for (var key in obj) {
    res[i++] = key;
  }
  return res;
};


/**
 * Get a value from an object multiple levels deep.  This is useful for
 * pulling values from deeply nested objects, such as JSON responses.
 * Example usage: getValueByKeys(jsonObj, 'foo', 'entries', 3)
 *
 * @param {!Object} obj An object to get the value from.  Can be array-like.
 * @param {...(string|number|!Array.<number|string>)} var_args A number of keys
 *     (as strings, or nubmers, for array-like objects).  Can also be
 *     specified as a single array of keys.
 * @return {*} The resulting value.  If, at any point, the value for a key
 *     is undefined, returns undefined.
 */
goog.object.getValueByKeys = function(obj, var_args) {
  var isArrayLike = goog.isArrayLike(var_args);
  var keys = isArrayLike ? var_args : arguments;

  // Start with the 2nd parameter for the variable parameters syntax.
  for (var i = isArrayLike ? 0 : 1; i < keys.length; i++) {
    obj = obj[keys[i]];
    if (!goog.isDef(obj)) {
      break;
    }
  }

  return obj;
};


/**
 * Whether the object/map/hash contains the given key.
 *
 * @param {Object} obj The object in which to look for key.
 * @param {*} key The key for which to check.
 * @return {boolean} true If the map contains the key.
 */
goog.object.containsKey = function(obj, key) {
  return key in obj;
};


/**
 * Whether the object/map/hash contains the given value. This is O(n).
 *
 * @param {Object} obj The object in which to look for val.
 * @param {*} val The value for which to check.
 * @return {boolean} true If the map contains the value.
 */
goog.object.containsValue = function(obj, val) {
  for (var key in obj) {
    if (obj[key] == val) {
      return true;
    }
  }
  return false;
};


/**
 * Searches an object for an element that satisfies the given condition and
 * returns its key.
 * @param {Object} obj The object to search in.
 * @param {function(*, string, Object): boolean} f The function to call for
 *     every element. Takes 3 arguments (the value, the key and the object) and
 *     should return a boolean.
 * @param {Object=} opt_this An optional "this" context for the function.
 * @return {string|undefined} The key of an element for which the function
 *     returns true or undefined if no such element is found.
 */
goog.object.findKey = function(obj, f, opt_this) {
  for (var key in obj) {
    if (f.call(opt_this, obj[key], key, obj)) {
      return key;
    }
  }
  return undefined;
};


/**
 * Searches an object for an element that satisfies the given condition and
 * returns its value.
 * @param {Object} obj The object to search in.
 * @param {function(*, string, Object): boolean} f The function to call for
 *     every element. Takes 3 arguments (the value, the key and the object) and
 *     should return a boolean.
 * @param {Object=} opt_this An optional "this" context for the function.
 * @return {*} The value of an element for which the function returns true or
 *     undefined if no such element is found.
 */
goog.object.findValue = function(obj, f, opt_this) {
  var key = goog.object.findKey(obj, f, opt_this);
  return key && obj[key];
};


/**
 * Whether the object/map/hash is empty.
 *
 * @param {Object} obj The object to test.
 * @return {boolean} true if obj is empty.
 */
goog.object.isEmpty = function(obj) {
  for (var key in obj) {
    return false;
  }
  return true;
};


/**
 * Removes all key value pairs from the object/map/hash.
 *
 * @param {Object} obj The object to clear.
 */
goog.object.clear = function(obj) {
  for (var i in obj) {
    delete obj[i];
  }
};


/**
 * Removes a key-value pair based on the key.
 *
 * @param {Object} obj The object from which to remove the key.
 * @param {*} key The key to remove.
 * @return {boolean} Whether an element was removed.
 */
goog.object.remove = function(obj, key) {
  var rv;
  if ((rv = key in obj)) {
    delete obj[key];
  }
  return rv;
};


/**
 * Adds a key-value pair to the object. Throws an exception if the key is
 * already in use. Use set if you want to change an existing pair.
 *
 * @param {Object} obj The object to which to add the key-value pair.
 * @param {string} key The key to add.
 * @param {*} val The value to add.
 */
goog.object.add = function(obj, key, val) {
  if (key in obj) {
    throw Error('The object already contains the key "' + key + '"');
  }
  goog.object.set(obj, key, val);
};


/**
 * Returns the value for the given key.
 *
 * @param {Object} obj The object from which to get the value.
 * @param {string} key The key for which to get the value.
 * @param {*=} opt_val The value to return if no item is found for the given
 *     key (default is undefined).
 * @return {*} The value for the given key.
 */
goog.object.get = function(obj, key, opt_val) {
  if (key in obj) {
    return obj[key];
  }
  return opt_val;
};


/**
 * Adds a key-value pair to the object/map/hash.
 *
 * @param {Object} obj The object to which to add the key-value pair.
 * @param {string} key The key to add.
 * @param {*} value The value to add.
 */
goog.object.set = function(obj, key, value) {
  obj[key] = value;
};


/**
 * Adds a key-value pair to the object/map/hash if it doesn't exist yet.
 *
 * @param {Object} obj The object to which to add the key-value pair.
 * @param {string} key The key to add.
 * @param {*} value The value to add if the key wasn't present.
 * @return {*} The value of the entry at the end of the function.
 */
goog.object.setIfUndefined = function(obj, key, value) {
  return key in obj ? obj[key] : (obj[key] = value);
};


/**
 * Does a flat clone of the object.
 *
 * @param {Object} obj Object to clone.
 * @return {!Object} Clone of the input object.
 */
goog.object.clone = function(obj) {
  // We cannot use the prototype trick because a lot of methods depend on where
  // the actual key is set.

  var res = {};
  for (var key in obj) {
    res[key] = obj[key];
  }
  return res;
  // We could also use goog.mixin but I wanted this to be independent from that.
};


/**
 * Clones a value. The input may be an Object, Array, or basic type. Objects and
 * arrays will be cloned recursively.
 *
 * WARNINGS:
 * <code>goog.object.unsafeClone</code> does not detect reference loops. Objects
 * that refer to themselves will cause infinite recursion.
 *
 * <code>goog.object.unsafeClone</code> is unaware of unique identifiers, and
 * copies UIDs created by <code>getUid</code> into cloned results.
 *
 * @param {*} obj The value to clone.
 * @return {*} A clone of the input value.
 */
goog.object.unsafeClone = function(obj) {
  var type = goog.typeOf(obj);
  if (type == 'object' || type == 'array') {
    if (obj.clone) {
      return obj.clone();
    }
    var clone = type == 'array' ? [] : {};
    for (var key in obj) {
      clone[key] = goog.object.unsafeClone(obj[key]);
    }
    return clone;
  }

  return obj;
};


/**
 * Returns a new object in which all the keys and values are interchanged
 * (keys become values and values become keys). If multiple keys map to the
 * same value, the chosen transposed value is implementation-dependent.
 *
 * @param {Object} obj The object to transpose.
 * @return {!Object} The transposed object.
 */
goog.object.transpose = function(obj) {
  var transposed = {};
  for (var key in obj) {
    transposed[obj[key]] = key;
  }
  return transposed;
};


/**
 * The names of the fields that are defined on Object.prototype.
 * @type {Array.<string>}
 * @private
 */
goog.object.PROTOTYPE_FIELDS_ = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
];


/**
 * Extends an object with another object.
 * This operates 'in-place'; it does not create a new Object.
 *
 * Example:
 * var o = {};
 * goog.object.extend(o, {a: 0, b: 1});
 * o; // {a: 0, b: 1}
 * goog.object.extend(o, {c: 2});
 * o; // {a: 0, b: 1, c: 2}
 *
 * @param {Object} target  The object to modify.
 * @param {...Object} var_args The objects from which values will be copied.
 */
goog.object.extend = function(target, var_args) {
  var key, source;
  for (var i = 1; i < arguments.length; i++) {
    source = arguments[i];
    for (key in source) {
      target[key] = source[key];
    }

    // For IE the for-in-loop does not contain any properties that are not
    // enumerable on the prototype object (for example isPrototypeOf from
    // Object.prototype) and it will also not include 'replace' on objects that
    // extend String and change 'replace' (not that it is common for anyone to
    // extend anything except Object).

    for (var j = 0; j < goog.object.PROTOTYPE_FIELDS_.length; j++) {
      key = goog.object.PROTOTYPE_FIELDS_[j];
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }
};


/**
 * Creates a new object built from the key-value pairs provided as arguments.
 * @param {...*} var_args If only one argument is provided and it is an array
 *     then this is used as the arguments,  otherwise even arguments are used as
 *     the property names and odd arguments are used as the property values.
 * @return {!Object} The new object.
 * @throws {Error} If there are uneven number of arguments or there is only one
 *     non array argument.
 */
goog.object.create = function(var_args) {
  var argLength = arguments.length;
  if (argLength == 1 && goog.isArray(arguments[0])) {
    return goog.object.create.apply(null, arguments[0]);
  }

  if (argLength % 2) {
    throw Error('Uneven number of arguments');
  }

  var rv = {};
  for (var i = 0; i < argLength; i += 2) {
    rv[arguments[i]] = arguments[i + 1];
  }
  return rv;
};


/**
 * Creates a new object where the property names come from the arguments but
 * the value is always set to true
 * @param {...*} var_args If only one argument is provided and it is an array
 *     then this is used as the arguments,  otherwise the arguments are used
 *     as the property names.
 * @return {!Object} The new object.
 */
goog.object.createSet = function(var_args) {
  var argLength = arguments.length;
  if (argLength == 1 && goog.isArray(arguments[0])) {
    return goog.object.createSet.apply(null, arguments[0]);
  }

  var rv = {};
  for (var i = 0; i < argLength; i++) {
    rv[arguments[i]] = true;
  }
  return rv;
};
// Copyright 2010 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Browser capability checks for the events package.
 *
 */


goog.provide('goog.events.BrowserFeature');

goog.require('goog.userAgent');


/**
 * Enum of browser capabilities.
 * @enum {boolean}
 */
goog.events.BrowserFeature = {
  /**
   * Whether the button attribute of the event is W3C compliant.  False in
   * Internet Explorer prior to version 9; document-version dependent.
   */
  HAS_W3C_BUTTON: !goog.userAgent.IE || goog.userAgent.isDocumentMode(9),

  /**
   * Whether the browser supports full W3C event model.
   */
  HAS_W3C_EVENT_SUPPORT: !goog.userAgent.IE || goog.userAgent.isDocumentMode(9),

  /**
   * To prevent default in IE7 for certain keydown events we need set the
   * keyCode to -1.
   */
  SET_KEY_CODE_TO_PREVENT_DEFAULT: goog.userAgent.IE &&
      !goog.userAgent.isVersion('8'),

  /**
   * Whether the {@code navigator.onLine} property is supported.
   */
  HAS_NAVIGATOR_ONLINE_PROPERTY: !goog.userAgent.WEBKIT ||
      goog.userAgent.isVersion('528'),

  /**
   * Whether HTML5 network online/offline events are supported.
   */
  HAS_HTML5_NETWORK_EVENT_SUPPORT:
      goog.userAgent.GECKO && goog.userAgent.isVersion('1.9b') ||
      goog.userAgent.IE && goog.userAgent.isVersion('8') ||
      goog.userAgent.OPERA && goog.userAgent.isVersion('9.5') ||
      goog.userAgent.WEBKIT && goog.userAgent.isVersion('528'),

  /**
   * Whether HTML5 network events fire on document.body, or otherwise the
   * window.
   */
  HTML5_NETWORK_EVENTS_FIRE_ON_BODY:
      goog.userAgent.GECKO && !goog.userAgent.isVersion('8') ||
      goog.userAgent.IE && !goog.userAgent.isVersion('9')
};
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities for manipulating arrays.
 *
 */


goog.provide('goog.array');
goog.provide('goog.array.ArrayLike');

goog.require('goog.asserts');


/**
 * @define {boolean} NATIVE_ARRAY_PROTOTYPES indicates whether the code should
 * rely on Array.prototype functions, if available.
 *
 * The Array.prototype functions can be defined by external libraries like
 * Prototype and setting this flag to false forces closure to use its own
 * goog.array implementation.
 *
 * If your javascript can be loaded by a third party site and you are wary about
 * relying on the prototype functions, specify
 * "--define goog.NATIVE_ARRAY_PROTOTYPES=false" to the JSCompiler.
 */
goog.NATIVE_ARRAY_PROTOTYPES = true;


/**
 * @typedef {Array|NodeList|Arguments|{length: number}}
 */
goog.array.ArrayLike;


/**
 * Returns the last element in an array without removing it.
 * @param {goog.array.ArrayLike} array The array.
 * @return {*} Last item in array.
 */
goog.array.peek = function(array) {
  return array[array.length - 1];
};


/**
 * Reference to the original {@code Array.prototype}.
 * @private
 */
goog.array.ARRAY_PROTOTYPE_ = Array.prototype;


// NOTE(arv): Since most of the array functions are generic it allows you to
// pass an array-like object. Strings have a length and are considered array-
// like. However, the 'in' operator does not work on strings so we cannot just
// use the array path even if the browser supports indexing into strings. We
// therefore end up splitting the string.


/**
 * Returns the index of the first element of an array with a specified
 * value, or -1 if the element is not present in the array.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-indexof}
 *
 * @param {goog.array.ArrayLike} arr The array to be searched.
 * @param {*} obj The object for which we are searching.
 * @param {number=} opt_fromIndex The index at which to start the search. If
 *     omitted the search starts at index 0.
 * @return {number} The index of the first matching array element.
 */
goog.array.indexOf = goog.NATIVE_ARRAY_PROTOTYPES &&
                     goog.array.ARRAY_PROTOTYPE_.indexOf ?
    function(arr, obj, opt_fromIndex) {
      goog.asserts.assert(arr.length != null);

      return goog.array.ARRAY_PROTOTYPE_.indexOf.call(arr, obj, opt_fromIndex);
    } :
    function(arr, obj, opt_fromIndex) {
      var fromIndex = opt_fromIndex == null ?
          0 : (opt_fromIndex < 0 ?
               Math.max(0, arr.length + opt_fromIndex) : opt_fromIndex);

      if (goog.isString(arr)) {
        // Array.prototype.indexOf uses === so only strings should be found.
        if (!goog.isString(obj) || obj.length != 1) {
          return -1;
        }
        return arr.indexOf(obj, fromIndex);
      }

      for (var i = fromIndex; i < arr.length; i++) {
        if (i in arr && arr[i] === obj)
          return i;
      }
      return -1;
    };


/**
 * Returns the index of the last element of an array with a specified value, or
 * -1 if the element is not present in the array.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-lastindexof}
 *
 * @param {goog.array.ArrayLike} arr The array to be searched.
 * @param {*} obj The object for which we are searching.
 * @param {?number=} opt_fromIndex The index at which to start the search. If
 *     omitted the search starts at the end of the array.
 * @return {number} The index of the last matching array element.
 */
goog.array.lastIndexOf = goog.NATIVE_ARRAY_PROTOTYPES &&
                         goog.array.ARRAY_PROTOTYPE_.lastIndexOf ?
    function(arr, obj, opt_fromIndex) {
      goog.asserts.assert(arr.length != null);

      // Firefox treats undefined and null as 0 in the fromIndex argument which
      // leads it to always return -1
      var fromIndex = opt_fromIndex == null ? arr.length - 1 : opt_fromIndex;
      return goog.array.ARRAY_PROTOTYPE_.lastIndexOf.call(arr, obj, fromIndex);
    } :
    function(arr, obj, opt_fromIndex) {
      var fromIndex = opt_fromIndex == null ? arr.length - 1 : opt_fromIndex;

      if (fromIndex < 0) {
        fromIndex = Math.max(0, arr.length + fromIndex);
      }

      if (goog.isString(arr)) {
        // Array.prototype.lastIndexOf uses === so only strings should be found.
        if (!goog.isString(obj) || obj.length != 1) {
          return -1;
        }
        return arr.lastIndexOf(obj, fromIndex);
      }

      for (var i = fromIndex; i >= 0; i--) {
        if (i in arr && arr[i] === obj)
          return i;
      }
      return -1;
    };


/**
 * Calls a function for each element in an array.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-foreach}
 *
 * @param {goog.array.ArrayLike} arr Array or array like object over
 *     which to iterate.
 * @param {?function(this: T, ...)} f The function to call for every element.
 *     This function takes 3 arguments (the element, the index and the array).
 *     The return value is ignored. The function is called only for indexes of
 *     the array which have assigned values; it is not called for indexes which
 *     have been deleted or which have never been assigned values.
 * @param {T=} opt_obj The object to be used as the value of 'this'
 *     within f.
 * @template T
 */
goog.array.forEach = goog.NATIVE_ARRAY_PROTOTYPES &&
                     goog.array.ARRAY_PROTOTYPE_.forEach ?
    function(arr, f, opt_obj) {
      goog.asserts.assert(arr.length != null);

      goog.array.ARRAY_PROTOTYPE_.forEach.call(arr, f, opt_obj);
    } :
    function(arr, f, opt_obj) {
      var l = arr.length;  // must be fixed during loop... see docs
      var arr2 = goog.isString(arr) ? arr.split('') : arr;
      for (var i = 0; i < l; i++) {
        if (i in arr2) {
          f.call(opt_obj, arr2[i], i, arr);
        }
      }
    };


/**
 * Calls a function for each element in an array, starting from the last
 * element rather than the first.
 *
 * @param {goog.array.ArrayLike} arr The array over which to iterate.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array). The return
 *     value is ignored.
 * @param {Object=} opt_obj The object to be used as the value of 'this'
 *     within f.
 */
goog.array.forEachRight = function(arr, f, opt_obj) {
  var l = arr.length;  // must be fixed during loop... see docs
  var arr2 = goog.isString(arr) ? arr.split('') : arr;
  for (var i = l - 1; i >= 0; --i) {
    if (i in arr2) {
      f.call(opt_obj, arr2[i], i, arr);
    }
  }
};


/**
 * Calls a function for each element in an array, and if the function returns
 * true adds the element to a new array.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-filter}
 *
 * @param {goog.array.ArrayLike} arr The array over which to iterate.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array) and must
 *     return a Boolean. If the return value is true the element is added to the
 *     result array. If it is false the element is not included.
 * @param {Object=} opt_obj The object to be used as the value of 'this'
 *     within f.
 * @return {!Array} a new array in which only elements that passed the test are
 *     present.
 */
goog.array.filter = goog.NATIVE_ARRAY_PROTOTYPES &&
                    goog.array.ARRAY_PROTOTYPE_.filter ?
    function(arr, f, opt_obj) {
      goog.asserts.assert(arr.length != null);

      return goog.array.ARRAY_PROTOTYPE_.filter.call(arr, f, opt_obj);
    } :
    function(arr, f, opt_obj) {
      var l = arr.length;  // must be fixed during loop... see docs
      var res = [];
      var resLength = 0;
      var arr2 = goog.isString(arr) ? arr.split('') : arr;
      for (var i = 0; i < l; i++) {
        if (i in arr2) {
          var val = arr2[i];  // in case f mutates arr2
          if (f.call(opt_obj, val, i, arr)) {
            res[resLength++] = val;
          }
        }
      }
      return res;
    };


/**
 * Calls a function for each element in an array and inserts the result into a
 * new array.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-map}
 *
 * @param {goog.array.ArrayLike} arr The array over which to iterate.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array) and should
 *     return something. The result will be inserted into a new array.
 * @param {Object=} opt_obj The object to be used as the value of 'this'
 *     within f.
 * @return {!Array} a new array with the results from f.
 */
goog.array.map = goog.NATIVE_ARRAY_PROTOTYPES &&
                 goog.array.ARRAY_PROTOTYPE_.map ?
    function(arr, f, opt_obj) {
      goog.asserts.assert(arr.length != null);

      return goog.array.ARRAY_PROTOTYPE_.map.call(arr, f, opt_obj);
    } :
    function(arr, f, opt_obj) {
      var l = arr.length;  // must be fixed during loop... see docs
      var res = new Array(l);
      var arr2 = goog.isString(arr) ? arr.split('') : arr;
      for (var i = 0; i < l; i++) {
        if (i in arr2) {
          res[i] = f.call(opt_obj, arr2[i], i, arr);
        }
      }
      return res;
    };


/**
 * Passes every element of an array into a function and accumulates the result.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-reduce}
 *
 * For example:
 * var a = [1, 2, 3, 4];
 * goog.array.reduce(a, function(r, v, i, arr) {return r + v;}, 0);
 * returns 10
 *
 * @param {goog.array.ArrayLike} arr The array over which to iterate.
 * @param {Function} f The function to call for every element. This function
 *     takes 4 arguments (the function's previous result or the initial value,
 *     the value of the current array element, the current array index, and the
 *     array itself)
 *     function(previousValue, currentValue, index, array).
 * @param {*} val The initial value to pass into the function on the first call.
 * @param {Object=} opt_obj  The object to be used as the value of 'this'
 *     within f.
 * @return {*} Result of evaluating f repeatedly across the values of the array.
 */
goog.array.reduce = function(arr, f, val, opt_obj) {
  if (arr.reduce) {
    if (opt_obj) {
      return arr.reduce(goog.bind(f, opt_obj), val);
    } else {
      return arr.reduce(f, val);
    }
  }
  var rval = val;
  goog.array.forEach(arr, function(val, index) {
    rval = f.call(opt_obj, rval, val, index, arr);
  });
  return rval;
};


/**
 * Passes every element of an array into a function and accumulates the result,
 * starting from the last element and working towards the first.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-reduceright}
 *
 * For example:
 * var a = ['a', 'b', 'c'];
 * goog.array.reduceRight(a, function(r, v, i, arr) {return r + v;}, '');
 * returns 'cba'
 *
 * @param {goog.array.ArrayLike} arr The array over which to iterate.
 * @param {Function} f The function to call for every element. This function
 *     takes 4 arguments (the function's previous result or the initial value,
 *     the value of the current array element, the current array index, and the
 *     array itself)
 *     function(previousValue, currentValue, index, array).
 * @param {*} val The initial value to pass into the function on the first call.
 * @param {Object=} opt_obj The object to be used as the value of 'this'
 *     within f.
 * @return {*} Object returned as a result of evaluating f repeatedly across the
 *     values of the array.
 */
goog.array.reduceRight = function(arr, f, val, opt_obj) {
  if (arr.reduceRight) {
    if (opt_obj) {
      return arr.reduceRight(goog.bind(f, opt_obj), val);
    } else {
      return arr.reduceRight(f, val);
    }
  }
  var rval = val;
  goog.array.forEachRight(arr, function(val, index) {
    rval = f.call(opt_obj, rval, val, index, arr);
  });
  return rval;
};


/**
 * Calls f for each element of an array. If any call returns true, some()
 * returns true (without checking the remaining elements). If all calls
 * return false, some() returns false.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-some}
 *
 * @param {goog.array.ArrayLike} arr The array to check.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array) and must
 *     return a Boolean.
 * @param {Object=} opt_obj  The object to be used as the value of 'this'
 *     within f.
 * @return {boolean} true if any element passes the test.
 */
goog.array.some = goog.NATIVE_ARRAY_PROTOTYPES &&
                  goog.array.ARRAY_PROTOTYPE_.some ?
    function(arr, f, opt_obj) {
      goog.asserts.assert(arr.length != null);

      return goog.array.ARRAY_PROTOTYPE_.some.call(arr, f, opt_obj);
    } :
    function(arr, f, opt_obj) {
      var l = arr.length;  // must be fixed during loop... see docs
      var arr2 = goog.isString(arr) ? arr.split('') : arr;
      for (var i = 0; i < l; i++) {
        if (i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
          return true;
        }
      }
      return false;
    };


/**
 * Call f for each element of an array. If all calls return true, every()
 * returns true. If any call returns false, every() returns false and
 * does not continue to check the remaining elements.
 *
 * See {@link http://tinyurl.com/developer-mozilla-org-array-every}
 *
 * @param {goog.array.ArrayLike} arr The array to check.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array) and must
 *     return a Boolean.
 * @param {Object=} opt_obj The object to be used as the value of 'this'
 *     within f.
 * @return {boolean} false if any element fails the test.
 */
goog.array.every = goog.NATIVE_ARRAY_PROTOTYPES &&
                   goog.array.ARRAY_PROTOTYPE_.every ?
    function(arr, f, opt_obj) {
      goog.asserts.assert(arr.length != null);

      return goog.array.ARRAY_PROTOTYPE_.every.call(arr, f, opt_obj);
    } :
    function(arr, f, opt_obj) {
      var l = arr.length;  // must be fixed during loop... see docs
      var arr2 = goog.isString(arr) ? arr.split('') : arr;
      for (var i = 0; i < l; i++) {
        if (i in arr2 && !f.call(opt_obj, arr2[i], i, arr)) {
          return false;
        }
      }
      return true;
    };


/**
 * Search an array for the first element that satisfies a given condition and
 * return that element.
 * @param {goog.array.ArrayLike} arr The array to search.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array) and should
 *     return a boolean.
 * @param {Object=} opt_obj An optional "this" context for the function.
 * @return {*} The first array element that passes the test, or null if no
 *     element is found.
 */
goog.array.find = function(arr, f, opt_obj) {
  var i = goog.array.findIndex(arr, f, opt_obj);
  return i < 0 ? null : goog.isString(arr) ? arr.charAt(i) : arr[i];
};


/**
 * Search an array for the first element that satisfies a given condition and
 * return its index.
 * @param {goog.array.ArrayLike} arr The array to search.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array) and should
 *     return a boolean.
 * @param {Object=} opt_obj An optional "this" context for the function.
 * @return {number} The index of the first array element that passes the test,
 *     or -1 if no element is found.
 */
goog.array.findIndex = function(arr, f, opt_obj) {
  var l = arr.length;  // must be fixed during loop... see docs
  var arr2 = goog.isString(arr) ? arr.split('') : arr;
  for (var i = 0; i < l; i++) {
    if (i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return i;
    }
  }
  return -1;
};


/**
 * Search an array (in reverse order) for the last element that satisfies a
 * given condition and return that element.
 * @param {goog.array.ArrayLike} arr The array to search.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array) and should
 *     return a boolean.
 * @param {Object=} opt_obj An optional "this" context for the function.
 * @return {*} The last array element that passes the test, or null if no
 *     element is found.
 */
goog.array.findRight = function(arr, f, opt_obj) {
  var i = goog.array.findIndexRight(arr, f, opt_obj);
  return i < 0 ? null : goog.isString(arr) ? arr.charAt(i) : arr[i];
};


/**
 * Search an array (in reverse order) for the last element that satisfies a
 * given condition and return its index.
 * @param {goog.array.ArrayLike} arr The array to search.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array) and should
 *     return a boolean.
 * @param {Object=} opt_obj An optional "this" context for the function.
 * @return {number} The index of the last array element that passes the test,
 *     or -1 if no element is found.
 */
goog.array.findIndexRight = function(arr, f, opt_obj) {
  var l = arr.length;  // must be fixed during loop... see docs
  var arr2 = goog.isString(arr) ? arr.split('') : arr;
  for (var i = l - 1; i >= 0; i--) {
    if (i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return i;
    }
  }
  return -1;
};


/**
 * Whether the array contains the given object.
 * @param {goog.array.ArrayLike} arr The array to test for the presence of the
 *     element.
 * @param {*} obj The object for which to test.
 * @return {boolean} true if obj is present.
 */
goog.array.contains = function(arr, obj) {
  return goog.array.indexOf(arr, obj) >= 0;
};


/**
 * Whether the array is empty.
 * @param {goog.array.ArrayLike} arr The array to test.
 * @return {boolean} true if empty.
 */
goog.array.isEmpty = function(arr) {
  return arr.length == 0;
};


/**
 * Clears the array.
 * @param {goog.array.ArrayLike} arr Array or array like object to clear.
 */
goog.array.clear = function(arr) {
  // For non real arrays we don't have the magic length so we delete the
  // indices.
  if (!goog.isArray(arr)) {
    for (var i = arr.length - 1; i >= 0; i--) {
      delete arr[i];
    }
  }
  arr.length = 0;
};


/**
 * Pushes an item into an array, if it's not already in the array.
 * @param {Array} arr Array into which to insert the item.
 * @param {*} obj Value to add.
 */
goog.array.insert = function(arr, obj) {
  if (!goog.array.contains(arr, obj)) {
    arr.push(obj);
  }
};


/**
 * Inserts an object at the given index of the array.
 * @param {goog.array.ArrayLike} arr The array to modify.
 * @param {*} obj The object to insert.
 * @param {number=} opt_i The index at which to insert the object. If omitted,
 *      treated as 0. A negative index is counted from the end of the array.
 */
goog.array.insertAt = function(arr, obj, opt_i) {
  goog.array.splice(arr, opt_i, 0, obj);
};


/**
 * Inserts at the given index of the array, all elements of another array.
 * @param {goog.array.ArrayLike} arr The array to modify.
 * @param {goog.array.ArrayLike} elementsToAdd The array of elements to add.
 * @param {number=} opt_i The index at which to insert the object. If omitted,
 *      treated as 0. A negative index is counted from the end of the array.
 */
goog.array.insertArrayAt = function(arr, elementsToAdd, opt_i) {
  goog.partial(goog.array.splice, arr, opt_i, 0).apply(null, elementsToAdd);
};


/**
 * Inserts an object into an array before a specified object.
 * @param {Array} arr The array to modify.
 * @param {*} obj The object to insert.
 * @param {*=} opt_obj2 The object before which obj should be inserted. If obj2
 *     is omitted or not found, obj is inserted at the end of the array.
 */
goog.array.insertBefore = function(arr, obj, opt_obj2) {
  var i;
  if (arguments.length == 2 || (i = goog.array.indexOf(arr, opt_obj2)) < 0) {
    arr.push(obj);
  } else {
    goog.array.insertAt(arr, obj, i);
  }
};


/**
 * Removes the first occurrence of a particular value from an array.
 * @param {goog.array.ArrayLike} arr Array from which to remove value.
 * @param {*} obj Object to remove.
 * @return {boolean} True if an element was removed.
 */
goog.array.remove = function(arr, obj) {
  var i = goog.array.indexOf(arr, obj);
  var rv;
  if ((rv = i >= 0)) {
    goog.array.removeAt(arr, i);
  }
  return rv;
};


/**
 * Removes from an array the element at index i
 * @param {goog.array.ArrayLike} arr Array or array like object from which to
 *     remove value.
 * @param {number} i The index to remove.
 * @return {boolean} True if an element was removed.
 */
goog.array.removeAt = function(arr, i) {
  goog.asserts.assert(arr.length != null);

  // use generic form of splice
  // splice returns the removed items and if successful the length of that
  // will be 1
  return goog.array.ARRAY_PROTOTYPE_.splice.call(arr, i, 1).length == 1;
};


/**
 * Removes the first value that satisfies the given condition.
 * @param {goog.array.ArrayLike} arr Array from which to remove value.
 * @param {Function} f The function to call for every element. This function
 *     takes 3 arguments (the element, the index and the array) and should
 *     return a boolean.
 * @param {Object=} opt_obj An optional "this" context for the function.
 * @return {boolean} True if an element was removed.
 */
goog.array.removeIf = function(arr, f, opt_obj) {
  var i = goog.array.findIndex(arr, f, opt_obj);
  if (i >= 0) {
    goog.array.removeAt(arr, i);
    return true;
  }
  return false;
};


/**
 * Returns a new array that is the result of joining the arguments.  If arrays
 * are passed then their items are added, however, if non-arrays are passed they
 * will be added to the return array as is.
 *
 * Note that ArrayLike objects will be added as is, rather than having their
 * items added.
 *
 * goog.array.concat([1, 2], [3, 4]) -> [1, 2, 3, 4]
 * goog.array.concat(0, [1, 2]) -> [0, 1, 2]
 * goog.array.concat([1, 2], null) -> [1, 2, null]
 *
 * There is bug in all current versions of IE (6, 7 and 8) where arrays created
 * in an iframe become corrupted soon (not immediately) after the iframe is
 * destroyed. This is common if loading data via goog.net.IframeIo, for example.
 * This corruption only affects the concat method which will start throwing
 * Catastrophic Errors (#-2147418113).
 *
 * See http://endoflow.com/scratch/corrupted-arrays.html for a test case.
 *
 * Internally goog.array should use this, so that all methods will continue to
 * work on these broken array objects.
 *
 * @param {...*} var_args Items to concatenate.  Arrays will have each item
 *     added, while primitives and objects will be added as is.
 * @return {!Array} The new resultant array.
 */
goog.array.concat = function(var_args) {
  return goog.array.ARRAY_PROTOTYPE_.concat.apply(
      goog.array.ARRAY_PROTOTYPE_, arguments);
};


/**
 * Does a shallow copy of an array.
 * @param {goog.array.ArrayLike} arr  Array or array-like object to clone.
 * @return {!Array} Clone of the input array.
 */
goog.array.clone = function(arr) {
  if (goog.isArray(arr)) {
    return goog.array.concat(/** @type {!Array} */ (arr));
  } else { // array like
    // Concat does not work with non arrays.
    var rv = [];
    for (var i = 0, len = arr.length; i < len; i++) {
      rv[i] = arr[i];
    }
    return rv;
  }
};


/**
 * Converts an object to an array.
 * @param {goog.array.ArrayLike} object  The object to convert to an array.
 * @return {!Array} The object converted into an array. If object has a
 *     length property, every property indexed with a non-negative number
 *     less than length will be included in the result. If object does not
 *     have a length property, an empty array will be returned.
 */
goog.array.toArray = function(object) {
  if (goog.isArray(object)) {
    // This fixes the JS compiler warning and forces the Object to an Array type
    return goog.array.concat(/** @type {!Array} */ (object));
  }
  // Clone what we hope to be an array-like object to an array.
  // We could check isArrayLike() first, but no check we perform would be as
  // reliable as simply making the call.
  return goog.array.clone(/** @type {Array} */ (object));
};


/**
 * Extends an array with another array, element, or "array like" object.
 * This function operates 'in-place', it does not create a new Array.
 *
 * Example:
 * var a = [];
 * goog.array.extend(a, [0, 1]);
 * a; // [0, 1]
 * goog.array.extend(a, 2);
 * a; // [0, 1, 2]
 *
 * @param {Array} arr1  The array to modify.
 * @param {...*} var_args The elements or arrays of elements to add to arr1.
 */
goog.array.extend = function(arr1, var_args) {
  for (var i = 1; i < arguments.length; i++) {
    var arr2 = arguments[i];
    // If we have an Array or an Arguments object we can just call push
    // directly.
    var isArrayLike;
    if (goog.isArray(arr2) ||
        // Detect Arguments. ES5 says that the [[Class]] of an Arguments object
        // is "Arguments" but only V8 and JSC/Safari gets this right. We instead
        // detect Arguments by checking for array like and presence of "callee".
        (isArrayLike = goog.isArrayLike(arr2)) &&
            // The getter for callee throws an exception in strict mode
            // according to section 10.6 in ES5 so check for presence instead.
            arr2.hasOwnProperty('callee')) {
      arr1.push.apply(arr1, arr2);

    } else if (isArrayLike) {
      // Otherwise loop over arr2 to prevent copying the object.
      var len1 = arr1.length;
      var len2 = arr2.length;
      for (var j = 0; j < len2; j++) {
        arr1[len1 + j] = arr2[j];
      }
    } else {
      arr1.push(arr2);
    }
  }
};


/**
 * Adds or removes elements from an array. This is a generic version of Array
 * splice. This means that it might work on other objects similar to arrays,
 * such as the arguments object.
 *
 * @param {goog.array.ArrayLike} arr The array to modify.
 * @param {number|undefined} index The index at which to start changing the
 *     array. If not defined, treated as 0.
 * @param {number} howMany How many elements to remove (0 means no removal. A
 *     value below 0 is treated as zero and so is any other non number. Numbers
 *     are floored).
 * @param {...*} var_args Optional, additional elements to insert into the
 *     array.
 * @return {!Array} the removed elements.
 */
goog.array.splice = function(arr, index, howMany, var_args) {
  goog.asserts.assert(arr.length != null);

  return goog.array.ARRAY_PROTOTYPE_.splice.apply(
      arr, goog.array.slice(arguments, 1));
};


/**
 * Returns a new array from a segment of an array. This is a generic version of
 * Array slice. This means that it might work on other objects similar to
 * arrays, such as the arguments object.
 *
 * @param {goog.array.ArrayLike} arr The array from which to copy a segment.
 * @param {number} start The index of the first element to copy.
 * @param {number=} opt_end The index after the last element to copy.
 * @return {!Array} A new array containing the specified segment of the original
 *     array.
 */
goog.array.slice = function(arr, start, opt_end) {
  goog.asserts.assert(arr.length != null);

  // passing 1 arg to slice is not the same as passing 2 where the second is
  // null or undefined (in that case the second argument is treated as 0).
  // we could use slice on the arguments object and then use apply instead of
  // testing the length
  if (arguments.length <= 2) {
    return goog.array.ARRAY_PROTOTYPE_.slice.call(arr, start);
  } else {
    return goog.array.ARRAY_PROTOTYPE_.slice.call(arr, start, opt_end);
  }
};


/**
 * Removes all duplicates from an array (retaining only the first
 * occurrence of each array element).  This function modifies the
 * array in place and doesn't change the order of the non-duplicate items.
 *
 * For objects, duplicates are identified as having the same unique ID as
 * defined by {@link goog.getUid}.
 *
 * Runtime: N,
 * Worstcase space: 2N (no dupes)
 *
 * @param {goog.array.ArrayLike} arr The array from which to remove duplicates.
 * @param {Array=} opt_rv An optional array in which to return the results,
 *     instead of performing the removal inplace.  If specified, the original
 *     array will remain unchanged.
 */
goog.array.removeDuplicates = function(arr, opt_rv) {
  var returnArray = opt_rv || arr;

  var seen = {}, cursorInsert = 0, cursorRead = 0;
  while (cursorRead < arr.length) {
    var current = arr[cursorRead++];

    // Prefix each type with a single character representing the type to
    // prevent conflicting keys (e.g. true and 'true').
    var key = goog.isObject(current) ?
        'o' + goog.getUid(current) :
        (typeof current).charAt(0) + current;

    if (!Object.prototype.hasOwnProperty.call(seen, key)) {
      seen[key] = true;
      returnArray[cursorInsert++] = current;
    }
  }
  returnArray.length = cursorInsert;
};


/**
 * Searches the specified array for the specified target using the binary
 * search algorithm.  If no opt_compareFn is specified, elements are compared
 * using <code>goog.array.defaultCompare</code>, which compares the elements
 * using the built in < and > operators.  This will produce the expected
 * behavior for homogeneous arrays of String(s) and Number(s). The array
 * specified <b>must</b> be sorted in ascending order (as defined by the
 * comparison function).  If the array is not sorted, results are undefined.
 * If the array contains multiple instances of the specified target value, any
 * of these instances may be found.
 *
 * Runtime: O(log n)
 *
 * @param {goog.array.ArrayLike} arr The array to be searched.
 * @param {*} target The sought value.
 * @param {Function=} opt_compareFn Optional comparison function by which the
 *     array is ordered. Should take 2 arguments to compare, and return a
 *     negative number, zero, or a positive number depending on whether the
 *     first argument is less than, equal to, or greater than the second.
 * @return {number} Lowest index of the target value if found, otherwise
 *     (-(insertion point) - 1). The insertion point is where the value should
 *     be inserted into arr to preserve the sorted property.  Return value >= 0
 *     iff target is found.
 */
goog.array.binarySearch = function(arr, target, opt_compareFn) {
  return goog.array.binarySearch_(arr,
      opt_compareFn || goog.array.defaultCompare, false /* isEvaluator */,
      target);
};


/**
 * Selects an index in the specified array using the binary search algorithm.
 * The evaluator receives an element and determines whether the desired index
 * is before, at, or after it.  The evaluator must be consistent (formally,
 * goog.array.map(goog.array.map(arr, evaluator, opt_obj), goog.math.sign)
 * must be monotonically non-increasing).
 *
 * Runtime: O(log n)
 *
 * @param {goog.array.ArrayLike} arr The array to be searched.
 * @param {Function} evaluator Evaluator function that receives 3 arguments
 *     (the element, the index and the array). Should return a negative number,
 *     zero, or a positive number depending on whether the desired index is
 *     before, at, or after the element passed to it.
 * @param {Object=} opt_obj The object to be used as the value of 'this'
 *     within evaluator.
 * @return {number} Index of the leftmost element matched by the evaluator, if
 *     such exists; otherwise (-(insertion point) - 1). The insertion point is
 *     the index of the first element for which the evaluator returns negative,
 *     or arr.length if no such element exists. The return value is non-negative
 *     iff a match is found.
 */
goog.array.binarySelect = function(arr, evaluator, opt_obj) {
  return goog.array.binarySearch_(arr, evaluator, true /* isEvaluator */,
      undefined /* opt_target */, opt_obj);
};


/**
 * Implementation of a binary search algorithm which knows how to use both
 * comparison functions and evaluators. If an evaluator is provided, will call
 * the evaluator with the given optional data object, conforming to the
 * interface defined in binarySelect. Otherwise, if a comparison function is
 * provided, will call the comparison function against the given data object.
 *
 * This implementation purposefully does not use goog.bind or goog.partial for
 * performance reasons.
 *
 * Runtime: O(log n)
 *
 * @param {goog.array.ArrayLike} arr The array to be searched.
 * @param {Function} compareFn Either an evaluator or a comparison function,
 *     as defined by binarySearch and binarySelect above.
 * @param {boolean} isEvaluator Whether the function is an evaluator or a
 *     comparison function.
 * @param {*=} opt_target If the function is a comparison function, then this is
 *     the target to binary search for.
 * @param {Object=} opt_selfObj If the function is an evaluator, this is an
  *    optional this object for the evaluator.
 * @return {number} Lowest index of the target value if found, otherwise
 *     (-(insertion point) - 1). The insertion point is where the value should
 *     be inserted into arr to preserve the sorted property.  Return value >= 0
 *     iff target is found.
 * @private
 */
goog.array.binarySearch_ = function(arr, compareFn, isEvaluator, opt_target,
    opt_selfObj) {
  var left = 0;  // inclusive
  var right = arr.length;  // exclusive
  var found;
  while (left < right) {
    var middle = (left + right) >> 1;
    var compareResult;
    if (isEvaluator) {
      compareResult = compareFn.call(opt_selfObj, arr[middle], middle, arr);
    } else {
      compareResult = compareFn(opt_target, arr[middle]);
    }
    if (compareResult > 0) {
      left = middle + 1;
    } else {
      right = middle;
      // We are looking for the lowest index so we can't return immediately.
      found = !compareResult;
    }
  }
  // left is the index if found, or the insertion point otherwise.
  // ~left is a shorthand for -left - 1.
  return found ? left : ~left;
};


/**
 * Sorts the specified array into ascending order.  If no opt_compareFn is
 * specified, elements are compared using
 * <code>goog.array.defaultCompare</code>, which compares the elements using
 * the built in < and > operators.  This will produce the expected behavior
 * for homogeneous arrays of String(s) and Number(s), unlike the native sort,
 * but will give unpredictable results for heterogenous lists of strings and
 * numbers with different numbers of digits.
 *
 * This sort is not guaranteed to be stable.
 *
 * Runtime: Same as <code>Array.prototype.sort</code>
 *
 * @param {Array} arr The array to be sorted.
 * @param {Function=} opt_compareFn Optional comparison function by which the
 *     array is to be ordered. Should take 2 arguments to compare, and return a
 *     negative number, zero, or a positive number depending on whether the
 *     first argument is less than, equal to, or greater than the second.
 */
goog.array.sort = function(arr, opt_compareFn) {
  // TODO(arv): Update type annotation since null is not accepted.
  goog.asserts.assert(arr.length != null);

  goog.array.ARRAY_PROTOTYPE_.sort.call(
      arr, opt_compareFn || goog.array.defaultCompare);
};


/**
 * Sorts the specified array into ascending order in a stable way.  If no
 * opt_compareFn is specified, elements are compared using
 * <code>goog.array.defaultCompare</code>, which compares the elements using
 * the built in < and > operators.  This will produce the expected behavior
 * for homogeneous arrays of String(s) and Number(s).
 *
 * Runtime: Same as <code>Array.prototype.sort</code>, plus an additional
 * O(n) overhead of copying the array twice.
 *
 * @param {Array} arr The array to be sorted.
 * @param {function(*, *): number=} opt_compareFn Optional comparison function
 *     by which the array is to be ordered. Should take 2 arguments to compare,
 *     and return a negative number, zero, or a positive number depending on
 *     whether the first argument is less than, equal to, or greater than the
 *     second.
 */
goog.array.stableSort = function(arr, opt_compareFn) {
  for (var i = 0; i < arr.length; i++) {
    arr[i] = {index: i, value: arr[i]};
  }
  var valueCompareFn = opt_compareFn || goog.array.defaultCompare;
  function stableCompareFn(obj1, obj2) {
    return valueCompareFn(obj1.value, obj2.value) || obj1.index - obj2.index;
  };
  goog.array.sort(arr, stableCompareFn);
  for (var i = 0; i < arr.length; i++) {
    arr[i] = arr[i].value;
  }
};


/**
 * Sorts an array of objects by the specified object key and compare
 * function. If no compare function is provided, the key values are
 * compared in ascending order using <code>goog.array.defaultCompare</code>.
 * This won't work for keys that get renamed by the compiler. So use
 * {'foo': 1, 'bar': 2} rather than {foo: 1, bar: 2}.
 * @param {Array.<Object>} arr An array of objects to sort.
 * @param {string} key The object key to sort by.
 * @param {Function=} opt_compareFn The function to use to compare key
 *     values.
 */
goog.array.sortObjectsByKey = function(arr, key, opt_compareFn) {
  var compare = opt_compareFn || goog.array.defaultCompare;
  goog.array.sort(arr, function(a, b) {
    return compare(a[key], b[key]);
  });
};


/**
 * Tells if the array is sorted.
 * @param {!Array} arr The array.
 * @param {Function=} opt_compareFn Function to compare the array elements.
 *     Should take 2 arguments to compare, and return a negative number, zero,
 *     or a positive number depending on whether the first argument is less
 *     than, equal to, or greater than the second.
 * @param {boolean=} opt_strict If true no equal elements are allowed.
 * @return {boolean} Whether the array is sorted.
 */
goog.array.isSorted = function(arr, opt_compareFn, opt_strict) {
  var compare = opt_compareFn || goog.array.defaultCompare;
  for (var i = 1; i < arr.length; i++) {
    var compareResult = compare(arr[i - 1], arr[i]);
    if (compareResult > 0 || compareResult == 0 && opt_strict) {
      return false;
    }
  }
  return true;
};


/**
 * Compares two arrays for equality. Two arrays are considered equal if they
 * have the same length and their corresponding elements are equal according to
 * the comparison function.
 *
 * @param {goog.array.ArrayLike} arr1 The first array to compare.
 * @param {goog.array.ArrayLike} arr2 The second array to compare.
 * @param {Function=} opt_equalsFn Optional comparison function.
 *     Should take 2 arguments to compare, and return true if the arguments
 *     are equal. Defaults to {@link goog.array.defaultCompareEquality} which
 *     compares the elements using the built-in '===' operator.
 * @return {boolean} Whether the two arrays are equal.
 */
goog.array.equals = function(arr1, arr2, opt_equalsFn) {
  if (!goog.isArrayLike(arr1) || !goog.isArrayLike(arr2) ||
      arr1.length != arr2.length) {
    return false;
  }
  var l = arr1.length;
  var equalsFn = opt_equalsFn || goog.array.defaultCompareEquality;
  for (var i = 0; i < l; i++) {
    if (!equalsFn(arr1[i], arr2[i])) {
      return false;
    }
  }
  return true;
};


/**
 * @deprecated Use {@link goog.array.equals}.
 * @param {goog.array.ArrayLike} arr1 See {@link goog.array.equals}.
 * @param {goog.array.ArrayLike} arr2 See {@link goog.array.equals}.
 * @param {Function=} opt_equalsFn See {@link goog.array.equals}.
 * @return {boolean} See {@link goog.array.equals}.
 */
goog.array.compare = function(arr1, arr2, opt_equalsFn) {
  return goog.array.equals(arr1, arr2, opt_equalsFn);
};


/**
 * 3-way array compare function.
 * @param {!goog.array.ArrayLike} arr1 The first array to compare.
 * @param {!goog.array.ArrayLike} arr2 The second array to compare.
 * @param {(function(*, *): number)=} opt_compareFn Optional comparison function
 *     by which the array is to be ordered. Should take 2 arguments to compare,
 *     and return a negative number, zero, or a positive number depending on
 *     whether the first argument is less than, equal to, or greater than the
 *     second.
 * @return {number} Negative number, zero, or a positive number depending on
 *     whether the first argument is less than, equal to, or greater than the
 *     second.
 */
goog.array.compare3 = function(arr1, arr2, opt_compareFn) {
  var compare = opt_compareFn || goog.array.defaultCompare;
  var l = Math.min(arr1.length, arr2.length);
  for (var i = 0; i < l; i++) {
    var result = compare(arr1[i], arr2[i]);
    if (result != 0) {
      return result;
    }
  }
  return goog.array.defaultCompare(arr1.length, arr2.length);
};


/**
 * Compares its two arguments for order, using the built in < and >
 * operators.
 * @param {*} a The first object to be compared.
 * @param {*} b The second object to be compared.
 * @return {number} A negative number, zero, or a positive number as the first
 *     argument is less than, equal to, or greater than the second.
 */
goog.array.defaultCompare = function(a, b) {
  return a > b ? 1 : a < b ? -1 : 0;
};


/**
 * Compares its two arguments for equality, using the built in === operator.
 * @param {*} a The first object to compare.
 * @param {*} b The second object to compare.
 * @return {boolean} True if the two arguments are equal, false otherwise.
 */
goog.array.defaultCompareEquality = function(a, b) {
  return a === b;
};


/**
 * Inserts a value into a sorted array. The array is not modified if the
 * value is already present.
 * @param {Array} array The array to modify.
 * @param {*} value The object to insert.
 * @param {Function=} opt_compareFn Optional comparison function by which the
 *     array is ordered. Should take 2 arguments to compare, and return a
 *     negative number, zero, or a positive number depending on whether the
 *     first argument is less than, equal to, or greater than the second.
 * @return {boolean} True if an element was inserted.
 */
goog.array.binaryInsert = function(array, value, opt_compareFn) {
  var index = goog.array.binarySearch(array, value, opt_compareFn);
  if (index < 0) {
    goog.array.insertAt(array, value, -(index + 1));
    return true;
  }
  return false;
};


/**
 * Removes a value from a sorted array.
 * @param {Array} array The array to modify.
 * @param {*} value The object to remove.
 * @param {Function=} opt_compareFn Optional comparison function by which the
 *     array is ordered. Should take 2 arguments to compare, and return a
 *     negative number, zero, or a positive number depending on whether the
 *     first argument is less than, equal to, or greater than the second.
 * @return {boolean} True if an element was removed.
 */
goog.array.binaryRemove = function(array, value, opt_compareFn) {
  var index = goog.array.binarySearch(array, value, opt_compareFn);
  return (index >= 0) ? goog.array.removeAt(array, index) : false;
};


/**
 * Splits an array into disjoint buckets according to a splitting function.
 * @param {Array} array The array.
 * @param {Function} sorter Function to call for every element.  This
 *     takes 3 arguments (the element, the index and the array) and must
 *     return a valid object key (a string, number, etc), or undefined, if
 *     that object should not be placed in a bucket.
 * @return {!Object} An object, with keys being all of the unique return values
 *     of sorter, and values being arrays containing the items for
 *     which the splitter returned that key.
 */
goog.array.bucket = function(array, sorter) {
  var buckets = {};

  for (var i = 0; i < array.length; i++) {
    var value = array[i];
    var key = sorter(value, i, array);
    if (goog.isDef(key)) {
      // Push the value to the right bucket, creating it if necessary.
      var bucket = buckets[key] || (buckets[key] = []);
      bucket.push(value);
    }
  }

  return buckets;
};


/**
 * Returns an array consisting of the given value repeated N times.
 *
 * @param {*} value The value to repeat.
 * @param {number} n The repeat count.
 * @return {!Array.<*>} An array with the repeated value.
 */
goog.array.repeat = function(value, n) {
  var array = [];
  for (var i = 0; i < n; i++) {
    array[i] = value;
  }
  return array;
};


/**
 * Returns an array consisting of every argument with all arrays
 * expanded in-place recursively.
 *
 * @param {...*} var_args The values to flatten.
 * @return {!Array.<*>} An array containing the flattened values.
 */
goog.array.flatten = function(var_args) {
  var result = [];
  for (var i = 0; i < arguments.length; i++) {
    var element = arguments[i];
    if (goog.isArray(element)) {
      result.push.apply(result, goog.array.flatten.apply(null, element));
    } else {
      result.push(element);
    }
  }
  return result;
};


/**
 * Rotates an array in-place. After calling this method, the element at
 * index i will be the element previously at index (i - n) %
 * array.length, for all values of i between 0 and array.length - 1,
 * inclusive.
 *
 * For example, suppose list comprises [t, a, n, k, s]. After invoking
 * rotate(array, 1) (or rotate(array, -4)), array will comprise [s, t, a, n, k].
 *
 * @param {!Array.<*>} array The array to rotate.
 * @param {number} n The amount to rotate.
 * @return {!Array.<*>} The array.
 */
goog.array.rotate = function(array, n) {
  goog.asserts.assert(array.length != null);

  if (array.length) {
    n %= array.length;
    if (n > 0) {
      goog.array.ARRAY_PROTOTYPE_.unshift.apply(array, array.splice(-n, n));
    } else if (n < 0) {
      goog.array.ARRAY_PROTOTYPE_.push.apply(array, array.splice(0, -n));
    }
  }
  return array;
};


/**
 * Creates a new array for which the element at position i is an array of the
 * ith element of the provided arrays.  The returned array will only be as long
 * as the shortest array provided; additional values are ignored.  For example,
 * the result of zipping [1, 2] and [3, 4, 5] is [[1,3], [2, 4]].
 *
 * This is similar to the zip() function in Python.  See {@link
 * http://docs.python.org/library/functions.html#zip}
 *
 * @param {...!goog.array.ArrayLike} var_args Arrays to be combined.
 * @return {!Array.<!Array>} A new array of arrays created from provided arrays.
 */
goog.array.zip = function(var_args) {
  if (!arguments.length) {
    return [];
  }
  var result = [];
  for (var i = 0; true; i++) {
    var value = [];
    for (var j = 0; j < arguments.length; j++) {
      var arr = arguments[j];
      // If i is larger than the array length, this is the shortest array.
      if (i >= arr.length) {
        return result;
      }
      value.push(arr[i]);
    }
    result.push(value);
  }
};


/**
 * Shuffles the values in the specified array using the Fisher-Yates in-place
 * shuffle (also known as the Knuth Shuffle). By default, calls Math.random()
 * and so resets the state of that random number generator. Similarly, may reset
 * the state of the any other specified random number generator.
 *
 * Runtime: O(n)
 *
 * @param {!Array} arr The array to be shuffled.
 * @param {Function=} opt_randFn Optional random function to use for shuffling.
 *     Takes no arguments, and returns a random number on the interval [0, 1).
 *     Defaults to Math.random() using JavaScript's built-in Math library.
 */
goog.array.shuffle = function(arr, opt_randFn) {
  var randFn = opt_randFn || Math.random;

  for (var i = arr.length - 1; i > 0; i--) {
    // Choose a random array index in [0, i] (inclusive with i).
    var j = Math.floor(randFn() * (i + 1));

    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
};
// Copyright 2010 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview A global registry for entry points into a program,
 * so that they can be instrumented. Each module should register their
 * entry points with this registry. Designed to be compiled out
 * if no instrumentation is requested.
 *
 * Entry points may be registered before or after a call to
 * goog.debug.entryPointRegistry.monitorAll. If an entry point is registered
 * later, the existing monitor will instrument the new entry point.
 *
 * @author nicksantos@google.com (Nick Santos)
 */

goog.provide('goog.debug.EntryPointMonitor');
goog.provide('goog.debug.entryPointRegistry');

goog.require('goog.asserts');



/**
 * @interface
 */
goog.debug.EntryPointMonitor = function() {};


/**
 * Instruments a function.
 *
 * @param {!Function} fn A function to instrument.
 * @return {!Function} The instrumented function.
 */
goog.debug.EntryPointMonitor.prototype.wrap;


/**
 * Try to remove an instrumentation wrapper created by this monitor.
 * If the function passed to unwrap is not a wrapper created by this
 * monitor, then we will do nothing.
 *
 * Notice that some wrappers may not be unwrappable. For example, if other
 * monitors have applied their own wrappers, then it will be impossible to
 * unwrap them because their wrappers will have captured our wrapper.
 *
 * So it is important that entry points are unwrapped in the reverse
 * order that they were wrapped.
 *
 * @param {!Function} fn A function to unwrap.
 * @return {!Function} The unwrapped function, or {@code fn} if it was not
 *     a wrapped function created by this monitor.
 */
goog.debug.EntryPointMonitor.prototype.unwrap;


/**
 * An array of entry point callbacks.
 * @type {!Array.<function(!Function)>}
 * @private
 */
goog.debug.entryPointRegistry.refList_ = [];


/**
 * Monitors that should wrap all the entry points.
 * @type {!Array.<!goog.debug.EntryPointMonitor>}
 * @private
 */
goog.debug.entryPointRegistry.monitors_ = [];


/**
 * Whether goog.debug.entryPointRegistry.monitorAll has ever been called.
 * Checking this allows the compiler to optimize out the registrations.
 * @type {boolean}
 * @private
 */
goog.debug.entryPointRegistry.monitorsMayExist_ = false;


/**
 * Register an entry point with this module.
 *
 * The entry point will be instrumented when a monitor is passed to
 * goog.debug.entryPointRegistry.monitorAll. If this has already occurred, the
 * entry point is instrumented immediately.
 *
 * @param {function(!Function)} callback A callback function which is called
 *     with a transforming function to instrument the entry point. The callback
 *     is responsible for wrapping the relevant entry point with the
 *     transforming function.
 */
goog.debug.entryPointRegistry.register = function(callback) {
  // Don't use push(), so that this can be compiled out.
  goog.debug.entryPointRegistry.refList_[
      goog.debug.entryPointRegistry.refList_.length] = callback;
  // If no one calls monitorAll, this can be compiled out.
  if (goog.debug.entryPointRegistry.monitorsMayExist_) {
    var monitors = goog.debug.entryPointRegistry.monitors_;
    for (var i = 0; i < monitors.length; i++) {
      callback(goog.bind(monitors[i].wrap, monitors[i]));
    }
  }
};


/**
 * Configures a monitor to wrap all entry points.
 *
 * Entry points that have already been registered are immediately wrapped by
 * the monitor. When an entry point is registered in the future, it will also
 * be wrapped by the monitor when it is registered.
 *
 * @param {!goog.debug.EntryPointMonitor} monitor An entry point monitor.
 */
goog.debug.entryPointRegistry.monitorAll = function(monitor) {
  goog.debug.entryPointRegistry.monitorsMayExist_ = true;
  var transformer = goog.bind(monitor.wrap, monitor);
  for (var i = 0; i < goog.debug.entryPointRegistry.refList_.length; i++) {
    goog.debug.entryPointRegistry.refList_[i](transformer);
  }
  goog.debug.entryPointRegistry.monitors_.push(monitor);
};


/**
 * Try to unmonitor all the entry points that have already been registered. If
 * an entry point is registered in the future, it will not be wrapped by the
 * monitor when it is registered. Note that this may fail if the entry points
 * have additional wrapping.
 *
 * @param {!goog.debug.EntryPointMonitor} monitor The last monitor to wrap
 *     the entry points.
 * @throws {Error} If the monitor is not the most recently configured monitor.
 */
goog.debug.entryPointRegistry.unmonitorAllIfPossible = function(monitor) {
  var monitors = goog.debug.entryPointRegistry.monitors_;
  goog.asserts.assert(monitor == monitors[monitors.length - 1],
      'Only the most recent monitor can be unwrapped.');
  var transformer = goog.bind(monitor.unwrap, monitor);
  for (var i = 0; i < goog.debug.entryPointRegistry.refList_.length; i++) {
    goog.debug.entryPointRegistry.refList_[i](transformer);
  }
  monitors.length--;
};
// Copyright 2009 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Definition of the goog.events.EventWrapper interface.
 *
 * @author eae@google.com (Emil A Eklund)
 */

goog.provide('goog.events.EventWrapper');



/**
 * Interface for event wrappers.
 * @interface
 */
goog.events.EventWrapper = function() {
};


/**
 * Adds an event listener using the wrapper on a DOM Node or an object that has
 * implemented {@link goog.events.EventTarget}. A listener can only be added
 * once to an object.
 *
 * @param {EventTarget|goog.events.EventTarget} src The node to listen to
 *     events on.
 * @param {Function|Object} listener Callback method, or an object with a
 *     handleEvent function.
 * @param {boolean=} opt_capt Whether to fire in capture phase (defaults to
 *     false).
 * @param {Object=} opt_scope Element in whose scope to call the listener.
 * @param {goog.events.EventHandler=} opt_eventHandler Event handler to add
 *     listener to.
 */
goog.events.EventWrapper.prototype.listen = function(src, listener, opt_capt,
    opt_scope, opt_eventHandler) {
};


/**
 * Removes an event listener added using goog.events.EventWrapper.listen.
 *
 * @param {EventTarget|goog.events.EventTarget} src The node to remove listener
 *    from.
 * @param {Function|Object} listener Callback method, or an object with a
 *     handleEvent function.
 * @param {boolean=} opt_capt Whether to fire in capture phase (defaults to
 *     false).
 * @param {Object=} opt_scope Element in whose scope to call the listener.
 * @param {goog.events.EventHandler=} opt_eventHandler Event handler to remove
 *     listener from.
 */
goog.events.EventWrapper.prototype.unlisten = function(src, listener, opt_capt,
    opt_scope, opt_eventHandler) {
};
// Copyright 2010 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Event Types.
 *
 * @author arv@google.com (Erik Arvidsson)
 * @author mirkov@google.com (Mirko Visontai)
 */


goog.provide('goog.events.EventType');

goog.require('goog.userAgent');


/**
 * Constants for event names.
 * @enum {string}
 */
goog.events.EventType = {
  // Mouse events
  CLICK: 'click',
  DBLCLICK: 'dblclick',
  MOUSEDOWN: 'mousedown',
  MOUSEUP: 'mouseup',
  MOUSEOVER: 'mouseover',
  MOUSEOUT: 'mouseout',
  MOUSEMOVE: 'mousemove',
  SELECTSTART: 'selectstart', // IE, Safari, Chrome

  // Key events
  KEYPRESS: 'keypress',
  KEYDOWN: 'keydown',
  KEYUP: 'keyup',

  // Focus
  BLUR: 'blur',
  FOCUS: 'focus',
  DEACTIVATE: 'deactivate', // IE only
  // NOTE: The following two events are not stable in cross-browser usage.
  //     WebKit and Opera implement DOMFocusIn/Out.
  //     IE implements focusin/out.
  //     Gecko implements neither see bug at
  //     https://bugzilla.mozilla.org/show_bug.cgi?id=396927.
  // The DOM Events Level 3 Draft deprecates DOMFocusIn in favor of focusin:
  //     http://dev.w3.org/2006/webapi/DOM-Level-3-Events/html/DOM3-Events.html
  // You can use FOCUS in Capture phase until implementations converge.
  FOCUSIN: goog.userAgent.IE ? 'focusin' : 'DOMFocusIn',
  FOCUSOUT: goog.userAgent.IE ? 'focusout' : 'DOMFocusOut',

  // Forms
  CHANGE: 'change',
  SELECT: 'select',
  SUBMIT: 'submit',
  INPUT: 'input',
  PROPERTYCHANGE: 'propertychange', // IE only

  // Drag and drop
  DRAGSTART: 'dragstart',
  DRAGENTER: 'dragenter',
  DRAGOVER: 'dragover',
  DRAGLEAVE: 'dragleave',
  DROP: 'drop',

  // WebKit touch events.
  TOUCHSTART: 'touchstart',
  TOUCHMOVE: 'touchmove',
  TOUCHEND: 'touchend',
  TOUCHCANCEL: 'touchcancel',

  // Misc
  CONTEXTMENU: 'contextmenu',
  ERROR: 'error',
  HELP: 'help',
  LOAD: 'load',
  LOSECAPTURE: 'losecapture',
  READYSTATECHANGE: 'readystatechange',
  RESIZE: 'resize',
  SCROLL: 'scroll',
  UNLOAD: 'unload',

  // HTML 5 History events
  // See http://www.w3.org/TR/html5/history.html#event-definitions
  HASHCHANGE: 'hashchange',
  PAGEHIDE: 'pagehide',
  PAGESHOW: 'pageshow',
  POPSTATE: 'popstate',

  // Copy and Paste
  // Support is limited. Make sure it works on your favorite browser
  // before using.
  // http://www.quirksmode.org/dom/events/cutcopypaste.html
  COPY: 'copy',
  PASTE: 'paste',
  CUT: 'cut',
  BEFORECOPY: 'beforecopy',
  BEFORECUT: 'beforecut',
  BEFOREPASTE: 'beforepaste',

  // HTML 5 worker events
  MESSAGE: 'message',
  CONNECT: 'connect',

  // CSS transition events. Based on the browser support described at:
  // https://developer.mozilla.org/en/css/css_transitions#Browser_compatibility
  TRANSITIONEND: goog.userAgent.WEBKIT ? 'webkitTransitionEnd' :
      (goog.userAgent.OPERA ? 'oTransitionEnd' : 'transitionend')
};
// Copyright 2011 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Definition of the disposable interface.  A disposable object
 * has a dispose method to to clean up references and resources.
 * @author nnaze@google.com (Nathan Naze)
 */


goog.provide('goog.disposable.IDisposable');



/**
 * Interface for a disposable object.  If a instance requires cleanup
 * (references COM objects, DOM notes, or other disposable objects), it should
 * implement this interface (it may subclass goog.Disposable).
 * @interface
 */
goog.disposable.IDisposable = function() {};


/**
 * Disposes of the object and its resources.
 * @return {void} Nothing.
 */
goog.disposable.IDisposable.prototype.dispose;


/**
 * @return {boolean} Whether the object has been disposed of.
 */
goog.disposable.IDisposable.prototype.isDisposed;
// Copyright 2005 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Implements the disposable interface. The dispose method is used
 * to clean up references and resources.
 * @author arv@google.com (Erik Arvidsson)
 */


goog.provide('goog.Disposable');
goog.provide('goog.dispose');

goog.require('goog.disposable.IDisposable');



/**
 * Class that provides the basic implementation for disposable objects. If your
 * class holds one or more references to COM objects, DOM nodes, or other
 * disposable objects, it should extend this class or implement the disposable
 * interface (defined in goog.disposable.IDisposable).
 * @constructor
 * @implements {goog.disposable.IDisposable}
 */
goog.Disposable = function() {
  if (goog.Disposable.ENABLE_MONITORING) {
    goog.Disposable.instances_[goog.getUid(this)] = this;
  }
};


/**
 * @define {boolean} Whether to enable the monitoring of the goog.Disposable
 *     instances. Switching on the monitoring is only recommended for debugging
 *     because it has a significant impact on performance and memory usage.
 *     If switched off, the monitoring code compiles down to 0 bytes.
 *     The monitoring expects that all disposable objects call the
 *     {@code goog.Disposable} base constructor.
 */
goog.Disposable.ENABLE_MONITORING = false;


/**
 * Maps the unique ID of every undisposed {@code goog.Disposable} object to
 * the object itself.
 * @type {!Object.<number, !goog.Disposable>}
 * @private
 */
goog.Disposable.instances_ = {};


/**
 * @return {!Array.<!goog.Disposable>} All {@code goog.Disposable} objects that
 *     haven't been disposed of.
 */
goog.Disposable.getUndisposedObjects = function() {
  var ret = [];
  for (var id in goog.Disposable.instances_) {
    if (goog.Disposable.instances_.hasOwnProperty(id)) {
      ret.push(goog.Disposable.instances_[Number(id)]);
    }
  }
  return ret;
};


/**
 * Clears the registry of undisposed objects but doesn't dispose of them.
 */
goog.Disposable.clearUndisposedObjects = function() {
  goog.Disposable.instances_ = {};
};


/**
 * Whether the object has been disposed of.
 * @type {boolean}
 * @private
 */
goog.Disposable.prototype.disposed_ = false;


/**
 * Disposables that should be disposed when this object is disposed.
 * @type {Array.<goog.disposable.IDisposable>}
 * @private
 */
goog.Disposable.prototype.dependentDisposables_;


/**
 * @return {boolean} Whether the object has been disposed of.
 */
goog.Disposable.prototype.isDisposed = function() {
  return this.disposed_;
};


/**
 * @return {boolean} Whether the object has been disposed of.
 * @deprecated Use {@link #isDisposed} instead.
 */
goog.Disposable.prototype.getDisposed = goog.Disposable.prototype.isDisposed;


/**
 * Disposes of the object. If the object hasn't already been disposed of, calls
 * {@link #disposeInternal}. Classes that extend {@code goog.Disposable} should
 * override {@link #disposeInternal} in order to delete references to COM
 * objects, DOM nodes, and other disposable objects. Reentrant.
 *
 * @return {void} Nothing.
 */
goog.Disposable.prototype.dispose = function() {
  if (!this.disposed_) {
    // Set disposed_ to true first, in case during the chain of disposal this
    // gets disposed recursively.
    this.disposed_ = true;
    this.disposeInternal();
    if (goog.Disposable.ENABLE_MONITORING) {
      var uid = goog.getUid(this);
      if (!goog.Disposable.instances_.hasOwnProperty(uid)) {
        throw Error(this + ' did not call the goog.Disposable base ' +
            'constructor or was disposed of after a clearUndisposedObjects ' +
            'call');
      }
      delete goog.Disposable.instances_[uid];
    }
  }
};


/**
 * Associates a disposable object with this object so that they will be disposed
 * together.
 * @param {goog.disposable.IDisposable} disposable that will be disposed when
 *     this object is disposed.
 */
goog.Disposable.prototype.registerDisposable = function(disposable) {
  if (!this.dependentDisposables_) {
    this.dependentDisposables_ = [];
  }
  this.dependentDisposables_.push(disposable);
};


/**
 * Deletes or nulls out any references to COM objects, DOM nodes, or other
 * disposable objects. Classes that extend {@code goog.Disposable} should
 * override this method.
 * Not reentrant. To avoid calling it twice, it must only be called from the
 * subclass' {@code disposeInternal} method. Everywhere else the public
 * {@code dispose} method must be used.
 * For example:
 * <pre>
 *   mypackage.MyClass = function() {
 *     goog.base(this);
 *     // Constructor logic specific to MyClass.
 *     ...
 *   };
 *   goog.inherits(mypackage.MyClass, goog.Disposable);
 *
 *   mypackage.MyClass.prototype.disposeInternal = function() {
 *     goog.base(this, 'disposeInternal');
 *     // Dispose logic specific to MyClass.
 *     ...
 *   };
 * </pre>
 * @protected
 */
goog.Disposable.prototype.disposeInternal = function() {
  if (this.dependentDisposables_) {
    goog.disposeAll.apply(null, this.dependentDisposables_);
  }
};


/**
 * Calls {@code dispose} on the argument if it supports it. If obj is not an
 *     object with a dispose() method, this is a no-op.
 * @param {*} obj The object to dispose of.
 */
goog.dispose = function(obj) {
  if (obj && typeof obj.dispose == 'function') {
    obj.dispose();
  }
};


/**
 * Calls {@code dispose} on each member of the list that supports it. (If the
 * member is an ArrayLike, then {@code goog.disposeAll()} will be called
 * recursively on each of its members.) If the member is not an object with a
 * {@code dispose()} method, then it is ignored.
 * @param {...*} var_args The list.
 */
goog.disposeAll = function(var_args) {
  for (var i = 0, len = arguments.length; i < len; ++i) {
    var disposable = arguments[i];
    if (goog.isArrayLike(disposable)) {
      goog.disposeAll.apply(null, disposable);
    } else {
      goog.dispose(disposable);
    }
  }
};
// Copyright 2005 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview A base class for event objects.
 *
 */


goog.provide('goog.events.Event');

goog.require('goog.Disposable');



/**
 * A base class for event objects, so that they can support preventDefault and
 * stopPropagation.
 *
 * @param {string} type Event Type.
 * @param {Object=} opt_target Reference to the object that is the target of
 *     this event. It has to implement the {@code EventTarget} interface
 *     declared at {@link http://developer.mozilla.org/en/DOM/EventTarget}.
 * @constructor
 * @extends {goog.Disposable}
 */
goog.events.Event = function(type, opt_target) {
  goog.Disposable.call(this);

  /**
   * Event type.
   * @type {string}
   */
  this.type = type;

  /**
   * Target of the event.
   * @type {Object|undefined}
   */
  this.target = opt_target;

  /**
   * Object that had the listener attached.
   * @type {Object|undefined}
   */
  this.currentTarget = this.target;
};
goog.inherits(goog.events.Event, goog.Disposable);


/** @override */
goog.events.Event.prototype.disposeInternal = function() {
  delete this.type;
  delete this.target;
  delete this.currentTarget;
};


/**
 * Whether to cancel the event in internal capture/bubble processing for IE.
 * @type {boolean}
 * @suppress {underscore} Technically public, but referencing this outside
 *     this package is strongly discouraged.
 */
goog.events.Event.prototype.propagationStopped_ = false;


/**
 * Return value for in internal capture/bubble processing for IE.
 * @type {boolean}
 * @suppress {underscore} Technically public, but referencing this outside
 *     this package is strongly discouraged.
 */
goog.events.Event.prototype.returnValue_ = true;


/**
 * Stops event propagation.
 */
goog.events.Event.prototype.stopPropagation = function() {
  this.propagationStopped_ = true;
};


/**
 * Prevents the default action, for example a link redirecting to a url.
 */
goog.events.Event.prototype.preventDefault = function() {
  this.returnValue_ = false;
};


/**
 * Stops the propagation of the event. It is equivalent to
 * {@code e.stopPropagation()}, but can be used as the callback argument of
 * {@link goog.events.listen} without declaring another function.
 * @param {!goog.events.Event} e An event.
 */
goog.events.Event.stopPropagation = function(e) {
  e.stopPropagation();
};


/**
 * Prevents the default action. It is equivalent to
 * {@code e.preventDefault()}, but can be used as the callback argument of
 * {@link goog.events.listen} without declaring another function.
 * @param {!goog.events.Event} e An event.
 */
goog.events.Event.preventDefault = function(e) {
  e.preventDefault();
};
// Copyright 2009 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Useful compiler idioms.
 *
 */

goog.provide('goog.reflect');


/**
 * Syntax for object literal casts.
 * @see http://go/jscompiler-renaming
 * @see http://code.google.com/p/closure-compiler/wiki/
 *      ExperimentalTypeBasedPropertyRenaming
 *
 * Use this if you have an object literal whose keys need to have the same names
 * as the properties of some class even after they are renamed by the compiler.
 *
 * @param {!Function} type Type to cast to.
 * @param {Object} object Object literal to cast.
 * @return {Object} The object literal.
 */
goog.reflect.object = function(type, object) {
  return object;
};


/**
 * To assert to the compiler that an operation is needed when it would
 * otherwise be stripped. For example:
 * <code>
 *     // Force a layout
 *     goog.reflect.sinkValue(dialog.offsetHeight);
 * </code>
 * @type {!Function}
 */
goog.reflect.sinkValue = function(x) {
  goog.reflect.sinkValue[' '](x);
  return x;
};


/**
 * The compiler should optimize this function away iff no one ever uses
 * goog.reflect.sinkValue.
 */
goog.reflect.sinkValue[' '] = goog.nullFunction;


/**
 * Check if a property can be accessed without throwing an exception.
 * @param {Object} obj The owner of the property.
 * @param {string} prop The property name.
 * @return {boolean} Whether the property is accessible. Will also return true
 *     if obj is null.
 */
goog.reflect.canAccessProperty = function(obj, prop) {
  /** @preserveTry */
  try {
    goog.reflect.sinkValue(obj[prop]);
    return true;
  } catch (e) {}
  return false;
};
// Copyright 2005 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview A patched, standardized event object for browser events.
 *
 * <pre>
 * The patched event object contains the following members:
 * - type           {string}    Event type, e.g. 'click'
 * - timestamp      {Date}      A date object for when the event was fired
 * - target         {Object}    The element that actually triggered the event
 * - currentTarget  {Object}    The element the listener is attached to
 * - relatedTarget  {Object}    For mouseover and mouseout, the previous object
 * - offsetX        {number}    X-coordinate relative to target
 * - offsetY        {number}    Y-coordinate relative to target
 * - clientX        {number}    X-coordinate relative to viewport
 * - clientY        {number}    Y-coordinate relative to viewport
 * - screenX        {number}    X-coordinate relative to the edge of the screen
 * - screenY        {number}    Y-coordinate relative to the edge of the screen
 * - button         {number}    Mouse button. Use isButton() to test.
 * - keyCode        {number}    Key-code
 * - ctrlKey        {boolean}   Was ctrl key depressed
 * - altKey         {boolean}   Was alt key depressed
 * - shiftKey       {boolean}   Was shift key depressed
 * - metaKey        {boolean}   Was meta key depressed
 * - state          {Object}    History state object
 *
 * NOTE: The keyCode member contains the raw browser keyCode. For normalized
 * key and character code use {@link goog.events.KeyHandler}.
 * </pre>
 *
 */

goog.provide('goog.events.BrowserEvent');
goog.provide('goog.events.BrowserEvent.MouseButton');

goog.require('goog.events.BrowserFeature');
goog.require('goog.events.Event');
goog.require('goog.events.EventType');
goog.require('goog.reflect');
goog.require('goog.userAgent');



/**
 * Accepts a browser event object and creates a patched, cross browser event
 * object.
 * The content of this object will not be initialized if no event object is
 * provided. If this is the case, init() needs to be invoked separately.
 * @param {Event=} opt_e Browser event object.
 * @param {Node=} opt_currentTarget Current target for event.
 * @constructor
 * @extends {goog.events.Event}
 */
goog.events.BrowserEvent = function(opt_e, opt_currentTarget) {
  if (opt_e) {
    this.init(opt_e, opt_currentTarget);
  }
};
goog.inherits(goog.events.BrowserEvent, goog.events.Event);


/**
 * Normalized button constants for the mouse.
 * @enum {number}
 */
goog.events.BrowserEvent.MouseButton = {
  LEFT: 0,
  MIDDLE: 1,
  RIGHT: 2
};


/**
 * Static data for mapping mouse buttons.
 * @type {Array.<number>}
 */
goog.events.BrowserEvent.IEButtonMap = [
  1, // LEFT
  4, // MIDDLE
  2  // RIGHT
];


/**
 * Target that fired the event.
 * @override
 * @type {Node}
 */
goog.events.BrowserEvent.prototype.target = null;


/**
 * Node that had the listener attached.
 * @override
 * @type {Node|undefined}
 */
goog.events.BrowserEvent.prototype.currentTarget;


/**
 * For mouseover and mouseout events, the related object for the event.
 * @type {Node}
 */
goog.events.BrowserEvent.prototype.relatedTarget = null;


/**
 * X-coordinate relative to target.
 * @type {number}
 */
goog.events.BrowserEvent.prototype.offsetX = 0;


/**
 * Y-coordinate relative to target.
 * @type {number}
 */
goog.events.BrowserEvent.prototype.offsetY = 0;


/**
 * X-coordinate relative to the window.
 * @type {number}
 */
goog.events.BrowserEvent.prototype.clientX = 0;


/**
 * Y-coordinate relative to the window.
 * @type {number}
 */
goog.events.BrowserEvent.prototype.clientY = 0;


/**
 * X-coordinate relative to the monitor.
 * @type {number}
 */
goog.events.BrowserEvent.prototype.screenX = 0;


/**
 * Y-coordinate relative to the monitor.
 * @type {number}
 */
goog.events.BrowserEvent.prototype.screenY = 0;


/**
 * Which mouse button was pressed.
 * @type {number}
 */
goog.events.BrowserEvent.prototype.button = 0;


/**
 * Keycode of key press.
 * @type {number}
 */
goog.events.BrowserEvent.prototype.keyCode = 0;


/**
 * Keycode of key press.
 * @type {number}
 */
goog.events.BrowserEvent.prototype.charCode = 0;


/**
 * Whether control was pressed at time of event.
 * @type {boolean}
 */
goog.events.BrowserEvent.prototype.ctrlKey = false;


/**
 * Whether alt was pressed at time of event.
 * @type {boolean}
 */
goog.events.BrowserEvent.prototype.altKey = false;


/**
 * Whether shift was pressed at time of event.
 * @type {boolean}
 */
goog.events.BrowserEvent.prototype.shiftKey = false;


/**
 * Whether the meta key was pressed at time of event.
 * @type {boolean}
 */
goog.events.BrowserEvent.prototype.metaKey = false;


/**
 * History state object, only set for PopState events where it's a copy of the
 * state object provided to pushState or replaceState.
 * @type {Object}
 */
goog.events.BrowserEvent.prototype.state;


/**
 * Whether the default platform modifier key was pressed at time of event.
 * (This is control for all platforms except Mac, where it's Meta.
 * @type {boolean}
 */
goog.events.BrowserEvent.prototype.platformModifierKey = false;


/**
 * The browser event object.
 * @type {Event}
 * @private
 */
goog.events.BrowserEvent.prototype.event_ = null;


/**
 * Accepts a browser event object and creates a patched, cross browser event
 * object.
 * @param {Event} e Browser event object.
 * @param {Node=} opt_currentTarget Current target for event.
 */
goog.events.BrowserEvent.prototype.init = function(e, opt_currentTarget) {
  var type = this.type = e.type;
  goog.events.Event.call(this, type);

  // TODO(nicksantos): Change this.target to type EventTarget.
  this.target = /** @type {Node} */ (e.target) || e.srcElement;

  this.currentTarget = opt_currentTarget;

  var relatedTarget = /** @type {Node} */ (e.relatedTarget);
  if (relatedTarget) {
    // There's a bug in FireFox where sometimes, relatedTarget will be a
    // chrome element, and accessing any property of it will get a permission
    // denied exception. See:
    // https://bugzilla.mozilla.org/show_bug.cgi?id=497780
    if (goog.userAgent.GECKO) {
      if (!goog.reflect.canAccessProperty(relatedTarget, 'nodeName')) {
        relatedTarget = null;
      }
    }
    // TODO(arv): Use goog.events.EventType when it has been refactored into its
    // own file.
  } else if (type == goog.events.EventType.MOUSEOVER) {
    relatedTarget = e.fromElement;
  } else if (type == goog.events.EventType.MOUSEOUT) {
    relatedTarget = e.toElement;
  }

  this.relatedTarget = relatedTarget;

  // Webkit emits a lame warning whenever layerX/layerY is accessed.
  // http://code.google.com/p/chromium/issues/detail?id=101733
  this.offsetX = (goog.userAgent.WEBKIT || e.offsetX !== undefined) ?
      e.offsetX : e.layerX;
  this.offsetY = (goog.userAgent.WEBKIT || e.offsetY !== undefined) ?
      e.offsetY : e.layerY;

  this.clientX = e.clientX !== undefined ? e.clientX : e.pageX;
  this.clientY = e.clientY !== undefined ? e.clientY : e.pageY;
  this.screenX = e.screenX || 0;
  this.screenY = e.screenY || 0;

  this.button = e.button;

  this.keyCode = e.keyCode || 0;
  this.charCode = e.charCode || (type == 'keypress' ? e.keyCode : 0);
  this.ctrlKey = e.ctrlKey;
  this.altKey = e.altKey;
  this.shiftKey = e.shiftKey;
  this.metaKey = e.metaKey;
  this.platformModifierKey = goog.userAgent.MAC ? e.metaKey : e.ctrlKey;
  this.state = e.state;
  this.event_ = e;
  delete this.returnValue_;
  delete this.propagationStopped_;
};


/**
 * Tests to see which button was pressed during the event. This is really only
 * useful in IE and Gecko browsers. And in IE, it's only useful for
 * mousedown/mouseup events, because click only fires for the left mouse button.
 *
 * Safari 2 only reports the left button being clicked, and uses the value '1'
 * instead of 0. Opera only reports a mousedown event for the middle button, and
 * no mouse events for the right button. Opera has default behavior for left and
 * middle click that can only be overridden via a configuration setting.
 *
 * There's a nice table of this mess at http://www.unixpapa.com/js/mouse.html.
 *
 * @param {goog.events.BrowserEvent.MouseButton} button The button
 *     to test for.
 * @return {boolean} True if button was pressed.
 */
goog.events.BrowserEvent.prototype.isButton = function(button) {
  if (!goog.events.BrowserFeature.HAS_W3C_BUTTON) {
    if (this.type == 'click') {
      return button == goog.events.BrowserEvent.MouseButton.LEFT;
    } else {
      return !!(this.event_.button &
          goog.events.BrowserEvent.IEButtonMap[button]);
    }
  } else {
    return this.event_.button == button;
  }
};


/**
 * Whether this has an "action"-producing mouse button.
 *
 * By definition, this includes left-click on windows/linux, and left-click
 * without the ctrl key on Macs.
 *
 * @return {boolean} The result.
 */
goog.events.BrowserEvent.prototype.isMouseActionButton = function() {
  // Webkit does not ctrl+click to be a right-click, so we
  // normalize it to behave like Gecko and Opera.
  return this.isButton(goog.events.BrowserEvent.MouseButton.LEFT) &&
      !(goog.userAgent.WEBKIT && goog.userAgent.MAC && this.ctrlKey);
};


/**
 * @override
 */
goog.events.BrowserEvent.prototype.stopPropagation = function() {
  goog.events.BrowserEvent.superClass_.stopPropagation.call(this);
  if (this.event_.stopPropagation) {
    this.event_.stopPropagation();
  } else {
    this.event_.cancelBubble = true;
  }
};


/**
 * @override
 */
goog.events.BrowserEvent.prototype.preventDefault = function() {
  goog.events.BrowserEvent.superClass_.preventDefault.call(this);
  var be = this.event_;
  if (!be.preventDefault) {
    be.returnValue = false;
    if (goog.events.BrowserFeature.SET_KEY_CODE_TO_PREVENT_DEFAULT) {
      /** @preserveTry */
      try {
        // Most keys can be prevented using returnValue. Some special keys
        // require setting the keyCode to -1 as well:
        //
        // In IE7:
        // F3, F5, F10, F11, Ctrl+P, Crtl+O, Ctrl+F (these are taken from IE6)
        //
        // In IE8:
        // Ctrl+P, Crtl+O, Ctrl+F (F1-F12 cannot be stopped through the event)
        //
        // We therefore do this for all function keys as well as when Ctrl key
        // is pressed.
        var VK_F1 = 112;
        var VK_F12 = 123;
        if (be.ctrlKey || be.keyCode >= VK_F1 && be.keyCode <= VK_F12) {
          be.keyCode = -1;
        }
      } catch (ex) {
        // IE throws an 'access denied' exception when trying to change
        // keyCode in some situations (e.g. srcElement is input[type=file],
        // or srcElement is an anchor tag rewritten by parent's innerHTML).
        // Do nothing in this case.
      }
    }
  } else {
    be.preventDefault();
  }
};


/**
 * @return {Event} The underlying browser event object.
 */
goog.events.BrowserEvent.prototype.getBrowserEvent = function() {
  return this.event_;
};


/** @override */
goog.events.BrowserEvent.prototype.disposeInternal = function() {
  goog.events.BrowserEvent.superClass_.disposeInternal.call(this);
  this.event_ = null;
  this.target = null;
  this.currentTarget = null;
  this.relatedTarget = null;
};
// Copyright 2005 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Event Manager.
 *
 * Provides an abstracted interface to the browsers' event
 * systems. This uses an indirect lookup of listener functions to avoid circular
 * references between DOM (in IE) or XPCOM (in Mozilla) objects which leak
 * memory. This makes it easier to write OO Javascript/DOM code.
 *
 * It simulates capture & bubble in Internet Explorer.
 *
 * The listeners will also automagically have their event objects patched, so
 * your handlers don't need to worry about the browser.
 *
 * Example usage:
 * <pre>
 * goog.events.listen(myNode, 'click', function(e) { alert('woo') });
 * goog.events.listen(myNode, 'mouseover', mouseHandler, true);
 * goog.events.unlisten(myNode, 'mouseover', mouseHandler, true);
 * goog.events.removeAll(myNode);
 * goog.events.removeAll();
 * </pre>
 *
 *                                            in IE and event object patching]
 *
 * @supported IE6+, FF1.5+, WebKit, Opera.
 * @see ../demos/events.html
 * @see ../demos/event-propagation.html
 * @see ../demos/stopevent.html
 */


// This uses 3 lookup tables/trees.
// listenerTree_ is a tree of type -> capture -> src uid -> [Listener]
// listeners_ is a map of key -> [Listener]
//
// The key is a field of the Listener. The Listener class also has the type,
// capture and the src so one can always trace back in the tree
//
// sources_: src uid -> [Listener]


goog.provide('goog.events');

goog.require('goog.array');
goog.require('goog.debug.entryPointRegistry');
goog.require('goog.debug.errorHandlerWeakDep');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.BrowserFeature');
goog.require('goog.events.Event');
goog.require('goog.events.EventWrapper');
goog.require('goog.events.Listener');
goog.require('goog.object');
goog.require('goog.userAgent');


/**
 * @define {boolean} Whether to always assume the garbage collector is good.
 * @deprecated This is no longer needed and will be removed once apps are
 * updated.
 */
goog.events.ASSUME_GOOD_GC = false;


/**
 * Container for storing event listeners and their proxies
 * @private
 * @type {Object.<goog.events.Listener>}
 */
goog.events.listeners_ = {};


/**
 * The root of the listener tree
 * @private
 * @type {Object}
 */
goog.events.listenerTree_ = {};


/**
 * Lookup for mapping source UIDs to listeners.
 * @private
 * @type {Object}
 */
goog.events.sources_ = {};


/**
 * String used to prepend to IE event types.  Not a constant so that it is not
 * inlined.
 * @type {string}
 * @private
 */
goog.events.onString_ = 'on';


/**
 * Map of computed on strings for IE event types. Caching this removes an extra
 * object allocation in goog.events.listen which improves IE6 performance.
 * @type {Object}
 * @private
 */
goog.events.onStringMap_ = {};


/**
 * Separator used to split up the various parts of an event key, to help avoid
 * the possibilities of collisions.
 * @type {string}
 * @private
 */
goog.events.keySeparator_ = '_';


/**
 * Adds an event listener for a specific event on a DOM Node or an object that
 * has implemented {@link goog.events.EventTarget}. A listener can only be
 * added once to an object and if it is added again the key for the listener
 * is returned.
 *
 * @param {EventTarget|goog.events.EventTarget} src The node to listen to
 *     events on.
 * @param {string|Array.<string>} type Event type or array of event types.
 * @param {Function|Object} listener Callback method, or an object with a
 *     handleEvent function.
 * @param {boolean=} opt_capt Whether to fire in capture phase (defaults to
 *     false).
 * @param {Object=} opt_handler Element in whose scope to call the listener.
 * @return {?number} Unique key for the listener.
 */
goog.events.listen = function(src, type, listener, opt_capt, opt_handler) {
  if (!type) {
    throw Error('Invalid event type');
  } else if (goog.isArray(type)) {
    for (var i = 0; i < type.length; i++) {
      goog.events.listen(src, type[i], listener, opt_capt, opt_handler);
    }
    return null;
  } else {
    var capture = !!opt_capt;
    var map = goog.events.listenerTree_;

    if (!(type in map)) {
      map[type] = {count_: 0, remaining_: 0};
    }
    map = map[type];

    if (!(capture in map)) {
      map[capture] = {count_: 0, remaining_: 0};
      map.count_++;
    }
    map = map[capture];

    var srcUid = goog.getUid(src);
    var listenerArray, listenerObj;

    // The remaining_ property is used to be able to short circuit the iteration
    // of the event listeners.
    //
    // Increment the remaining event listeners to call even if this event might
    // already have been fired. At this point we do not know if the event has
    // been fired and it is too expensive to find out. By incrementing it we are
    // guaranteed that we will not skip any event listeners.
    map.remaining_++;

    // Do not use srcUid in map here since that will cast the number to a
    // string which will allocate one string object.
    if (!map[srcUid]) {
      listenerArray = map[srcUid] = [];
      map.count_++;
    } else {
      listenerArray = map[srcUid];
      // Ensure that the listeners do not already contain the current listener
      for (var i = 0; i < listenerArray.length; i++) {
        listenerObj = listenerArray[i];
        if (listenerObj.listener == listener &&
            listenerObj.handler == opt_handler) {

          // If this listener has been removed we should not return its key. It
          // is OK that we create new listenerObj below since the removed one
          // will be cleaned up later.
          if (listenerObj.removed) {
            break;
          }

          // We already have this listener. Return its key.
          return listenerArray[i].key;
        }
      }
    }

    var proxy = goog.events.getProxy();
    proxy.src = src;
    listenerObj = new goog.events.Listener();
    listenerObj.init(listener, proxy, src, type, capture, opt_handler);
    var key = listenerObj.key;
    proxy.key = key;

    listenerArray.push(listenerObj);
    goog.events.listeners_[key] = listenerObj;

    if (!goog.events.sources_[srcUid]) {
      goog.events.sources_[srcUid] = [];
    }
    goog.events.sources_[srcUid].push(listenerObj);


    // Attach the proxy through the browser's API
    if (src.addEventListener) {
      if (src == goog.global || !src.customEvent_) {
        src.addEventListener(type, proxy, capture);
      }
    } else {
      // The else above used to be else if (src.attachEvent) and then there was
      // another else statement that threw an exception warning the developer
      // they made a mistake. This resulted in an extra object allocation in IE6
      // due to a wrapper object that had to be implemented around the element
      // and so was removed.
      src.attachEvent(goog.events.getOnString_(type), proxy);
    }

    return key;
  }
};


/**
 * Helper function for returning a proxy function.
 * @return {Function} A new or reused function object.
 */
goog.events.getProxy = function() {
  var proxyCallbackFunction = goog.events.handleBrowserEvent_;
  // Use a local var f to prevent one allocation.
  var f = goog.events.BrowserFeature.HAS_W3C_EVENT_SUPPORT ?
      function(eventObject) {
        return proxyCallbackFunction.call(f.src, f.key, eventObject);
      } :
      function(eventObject) {
        var v = proxyCallbackFunction.call(f.src, f.key, eventObject);
        // NOTE(user): In IE, we hack in a capture phase. However, if
        // there is inline event handler which tries to prevent default (for
        // example <a href="..." onclick="return false">...</a>) in a
        // descendant element, the prevent default will be overridden
        // by this listener if this listener were to return true. Hence, we
        // return undefined.
        if (!v) return v;
      };
  return f;
};


/**
 * Adds an event listener for a specific event on a DomNode or an object that
 * has implemented {@link goog.events.EventTarget}. After the event has fired
 * the event listener is removed from the target.
 *
 * @param {EventTarget|goog.events.EventTarget} src The node to listen to
 *     events on.
 * @param {string|Array.<string>} type Event type or array of event types.
 * @param {Function|Object} listener Callback method.
 * @param {boolean=} opt_capt Fire in capture phase?.
 * @param {Object=} opt_handler Element in whose scope to call the listener.
 * @return {?number} Unique key for the listener.
 */
goog.events.listenOnce = function(src, type, listener, opt_capt, opt_handler) {
  if (goog.isArray(type)) {
    for (var i = 0; i < type.length; i++) {
      goog.events.listenOnce(src, type[i], listener, opt_capt, opt_handler);
    }
    return null;
  }

  var key = goog.events.listen(src, type, listener, opt_capt, opt_handler);
  var listenerObj = goog.events.listeners_[key];
  listenerObj.callOnce = true;
  return key;
};


/**
 * Adds an event listener with a specific event wrapper on a DOM Node or an
 * object that has implemented {@link goog.events.EventTarget}. A listener can
 * only be added once to an object.
 *
 * @param {EventTarget|goog.events.EventTarget} src The node to listen to
 *     events on.
 * @param {goog.events.EventWrapper} wrapper Event wrapper to use.
 * @param {Function|Object} listener Callback method, or an object with a
 *     handleEvent function.
 * @param {boolean=} opt_capt Whether to fire in capture phase (defaults to
 *     false).
 * @param {Object=} opt_handler Element in whose scope to call the listener.
 */
goog.events.listenWithWrapper = function(src, wrapper, listener, opt_capt,
    opt_handler) {
  wrapper.listen(src, listener, opt_capt, opt_handler);
};


/**
 * Removes an event listener which was added with listen().
 *
 * @param {EventTarget|goog.events.EventTarget} src The target to stop
 *     listening to events on.
 * @param {string|Array.<string>} type The name of the event without the 'on'
 *     prefix.
 * @param {Function|Object} listener The listener function to remove.
 * @param {boolean=} opt_capt In DOM-compliant browsers, this determines
 *     whether the listener is fired during the capture or bubble phase of the
 *     event.
 * @param {Object=} opt_handler Element in whose scope to call the listener.
 * @return {?boolean} indicating whether the listener was there to remove.
 */
goog.events.unlisten = function(src, type, listener, opt_capt, opt_handler) {
  if (goog.isArray(type)) {
    for (var i = 0; i < type.length; i++) {
      goog.events.unlisten(src, type[i], listener, opt_capt, opt_handler);
    }
    return null;
  }

  var capture = !!opt_capt;

  var listenerArray = goog.events.getListeners_(src, type, capture);
  if (!listenerArray) {
    return false;
  }

  for (var i = 0; i < listenerArray.length; i++) {
    if (listenerArray[i].listener == listener &&
        listenerArray[i].capture == capture &&
        listenerArray[i].handler == opt_handler) {
      return goog.events.unlistenByKey(listenerArray[i].key);
    }
  }

  return false;
};


/**
 * Removes an event listener which was added with listen() by the key
 * returned by listen().
 *
 * @param {?number} key The key returned by listen() for this event listener.
 * @return {boolean} indicating whether the listener was there to remove.
 */
goog.events.unlistenByKey = function(key) {
  // Do not use key in listeners here since that will cast the number to a
  // string which will allocate one string object.
  if (!goog.events.listeners_[key]) {
    return false;
  }
  var listener = goog.events.listeners_[key];

  if (listener.removed) {
    return false;
  }

  var src = listener.src;
  var type = listener.type;
  var proxy = listener.proxy;
  var capture = listener.capture;

  if (src.removeEventListener) {
    // EventTarget calls unlisten so we need to ensure that the source is not
    // an event target to prevent re-entry.
    // TODO(arv): What is this goog.global for? Why would anyone listen to
    // events on the [[Global]] object? Is it supposed to be window? Why would
    // we not want to allow removing event listeners on the window?
    if (src == goog.global || !src.customEvent_) {
      src.removeEventListener(type, proxy, capture);
    }
  } else if (src.detachEvent) {
    src.detachEvent(goog.events.getOnString_(type), proxy);
  }

  var srcUid = goog.getUid(src);
  var listenerArray = goog.events.listenerTree_[type][capture][srcUid];

  // In a perfect implementation we would decrement the remaining_ field here
  // but then we would need to know if the listener has already been fired or
  // not. We therefore skip doing this and in this uncommon case the entire
  // ancestor chain will need to be traversed as before.

  // Remove from sources_
  if (goog.events.sources_[srcUid]) {
    var sourcesArray = goog.events.sources_[srcUid];
    goog.array.remove(sourcesArray, listener);
    if (sourcesArray.length == 0) {
      delete goog.events.sources_[srcUid];
    }
  }

  listener.removed = true;
  listenerArray.needsCleanup_ = true;
  goog.events.cleanUp_(type, capture, srcUid, listenerArray);

  delete goog.events.listeners_[key];

  return true;
};


/**
 * Removes an event listener which was added with listenWithWrapper().
 *
 * @param {EventTarget|goog.events.EventTarget} src The target to stop
 *     listening to events on.
 * @param {goog.events.EventWrapper} wrapper Event wrapper to use.
 * @param {Function|Object} listener The listener function to remove.
 * @param {boolean=} opt_capt In DOM-compliant browsers, this determines
 *     whether the listener is fired during the capture or bubble phase of the
 *     event.
 * @param {Object=} opt_handler Element in whose scope to call the listener.
 */
goog.events.unlistenWithWrapper = function(src, wrapper, listener, opt_capt,
    opt_handler) {
  wrapper.unlisten(src, listener, opt_capt, opt_handler);
};


/**
 * Cleans up the listener array as well as the listener tree
 * @param {string} type  The type of the event.
 * @param {boolean} capture Whether to clean up capture phase listeners instead
 *     bubble phase listeners.
 * @param {number} srcUid  The unique ID of the source.
 * @param {Array.<goog.events.Listener>} listenerArray The array being cleaned.
 * @private
 */
goog.events.cleanUp_ = function(type, capture, srcUid, listenerArray) {
  // The listener array gets locked during the dispatch phase so that removals
  // of listeners during this phase does not screw up the indeces. This method
  // is called after we have removed a listener as well as after the dispatch
  // phase in case any listeners were removed.
  if (!listenerArray.locked_) { // catches both 0 and not set
    if (listenerArray.needsCleanup_) {
      // Loop over the listener array and remove listeners that have removed set
      // to true. This could have been done with filter or something similar but
      // we want to change the array in place and we want to minimize
      // allocations. Adding a listener during this phase adds to the end of the
      // array so that works fine as long as the length is rechecked every in
      // iteration.
      for (var oldIndex = 0, newIndex = 0;
           oldIndex < listenerArray.length;
           oldIndex++) {
        if (listenerArray[oldIndex].removed) {
          var proxy = listenerArray[oldIndex].proxy;
          proxy.src = null;
          continue;
        }
        if (oldIndex != newIndex) {
          listenerArray[newIndex] = listenerArray[oldIndex];
        }
        newIndex++;
      }
      listenerArray.length = newIndex;

      listenerArray.needsCleanup_ = false;

      // In case the length is now zero we release the object.
      if (newIndex == 0) {
        delete goog.events.listenerTree_[type][capture][srcUid];
        goog.events.listenerTree_[type][capture].count_--;

        if (goog.events.listenerTree_[type][capture].count_ == 0) {
          delete goog.events.listenerTree_[type][capture];
          goog.events.listenerTree_[type].count_--;
        }

        if (goog.events.listenerTree_[type].count_ == 0) {
          delete goog.events.listenerTree_[type];
        }
      }

    }
  }
};


/**
 * Removes all listeners from an object, if no object is specified it will
 * remove all listeners that have been registered.  You can also optionally
 * remove listeners of a particular type or capture phase.
 *
 * @param {Object=} opt_obj Object to remove listeners from.
 * @param {string=} opt_type Type of event to, default is all types.
 * @param {boolean=} opt_capt Whether to remove the listeners from the capture
 *     or bubble phase.  If unspecified, will remove both.
 * @return {number} Number of listeners removed.
 */
goog.events.removeAll = function(opt_obj, opt_type, opt_capt) {
  var count = 0;

  var noObj = opt_obj == null;
  var noType = opt_type == null;
  var noCapt = opt_capt == null;
  opt_capt = !!opt_capt;

  if (!noObj) {
    var srcUid = goog.getUid(/** @type {Object} */ (opt_obj));
    if (goog.events.sources_[srcUid]) {
      var sourcesArray = goog.events.sources_[srcUid];
      for (var i = sourcesArray.length - 1; i >= 0; i--) {
        var listener = sourcesArray[i];
        if ((noType || opt_type == listener.type) &&
            (noCapt || opt_capt == listener.capture)) {
          goog.events.unlistenByKey(listener.key);
          count++;
        }
      }
    }
  } else {
    // Loop over the sources_ map instead of over the listeners_ since it is
    // smaller which results in fewer allocations.
    goog.object.forEach(goog.events.sources_, function(listeners) {
      for (var i = listeners.length - 1; i >= 0; i--) {
        var listener = listeners[i];
        if ((noType || opt_type == listener.type) &&
            (noCapt || opt_capt == listener.capture)) {
          goog.events.unlistenByKey(listener.key);
          count++;
        }
      }
    });
  }

  return count;
};


/**
 * Gets the listeners for a given object, type and capture phase.
 *
 * @param {Object} obj Object to get listeners for.
 * @param {string} type Event type.
 * @param {boolean} capture Capture phase?.
 * @return {Array.<goog.events.Listener>} Array of listener objects.
 */
goog.events.getListeners = function(obj, type, capture) {
  return goog.events.getListeners_(obj, type, capture) || [];
};


/**
 * Gets the listeners for a given object, type and capture phase.
 *
 * @param {Object} obj Object to get listeners for.
 * @param {?string} type Event type.
 * @param {boolean} capture Capture phase?.
 * @return {Array.<goog.events.Listener>?} Array of listener objects.
 *     Returns null if object has no listeners of that type.
 * @private
 */
goog.events.getListeners_ = function(obj, type, capture) {
  var map = goog.events.listenerTree_;
  if (type in map) {
    map = map[type];
    if (capture in map) {
      map = map[capture];
      var objUid = goog.getUid(obj);
      if (map[objUid]) {
        return map[objUid];
      }
    }
  }

  return null;
};


/**
 * Gets the goog.events.Listener for the event or null if no such listener is
 * in use.
 *
 * @param {EventTarget|goog.events.EventTarget} src The node from which to get
 *     listeners.
 * @param {?string} type The name of the event without the 'on' prefix.
 * @param {Function|Object} listener The listener function to get.
 * @param {boolean=} opt_capt In DOM-compliant browsers, this determines
 *                            whether the listener is fired during the
 *                            capture or bubble phase of the event.
 * @param {Object=} opt_handler Element in whose scope to call the listener.
 * @return {goog.events.Listener?} the found listener or null if not found.
 */
goog.events.getListener = function(src, type, listener, opt_capt, opt_handler) {
  var capture = !!opt_capt;
  var listenerArray = goog.events.getListeners_(src, type, capture);
  if (listenerArray) {
    for (var i = 0; i < listenerArray.length; i++) {
      // If goog.events.unlistenByKey is called during an event dispatch
      // then the listener array won't get cleaned up and there might be
      // 'removed' listeners in the list. Ignore those.
      if (!listenerArray[i].removed &&
          listenerArray[i].listener == listener &&
          listenerArray[i].capture == capture &&
          listenerArray[i].handler == opt_handler) {
        // We already have this listener. Return its key.
        return listenerArray[i];
      }
    }
  }
  return null;
};


/**
 * Returns whether an event target has any active listeners matching the
 * specified signature. If either the type or capture parameters are
 * unspecified, the function will match on the remaining criteria.
 *
 * @param {EventTarget|goog.events.EventTarget} obj Target to get listeners for.
 * @param {string=} opt_type Event type.
 * @param {boolean=} opt_capture Whether to check for capture or bubble-phase
 *     listeners.
 * @return {boolean} Whether an event target has one or more listeners matching
 *     the requested type and/or capture phase.
 */
goog.events.hasListener = function(obj, opt_type, opt_capture) {
  var objUid = goog.getUid(obj);
  var listeners = goog.events.sources_[objUid];

  if (listeners) {
    var hasType = goog.isDef(opt_type);
    var hasCapture = goog.isDef(opt_capture);

    if (hasType && hasCapture) {
      // Lookup in the listener tree whether the specified listener exists.
      var map = goog.events.listenerTree_[opt_type];
      return !!map && !!map[opt_capture] && objUid in map[opt_capture];

    } else if (!(hasType || hasCapture)) {
      // Simple check for whether the event target has any listeners at all.
      return true;

    } else {
      // Iterate through the listeners for the event target to find a match.
      return goog.array.some(listeners, function(listener) {
        return (hasType && listener.type == opt_type) ||
               (hasCapture && listener.capture == opt_capture);
      });
    }
  }

  return false;
};


/**
 * Provides a nice string showing the normalized event objects public members
 * @param {Object} e Event Object.
 * @return {string} String of the public members of the normalized event object.
 */
goog.events.expose = function(e) {
  var str = [];
  for (var key in e) {
    if (e[key] && e[key].id) {
      str.push(key + ' = ' + e[key] + ' (' + e[key].id + ')');
    } else {
      str.push(key + ' = ' + e[key]);
    }
  }
  return str.join('\n');
};


/**
 * Returns a string wth on prepended to the specified type. This is used for IE
 * which expects "on" to be prepended. This function caches the string in order
 * to avoid extra allocations in steady state.
 * @param {string} type Event type strng.
 * @return {string} The type string with 'on' prepended.
 * @private
 */
goog.events.getOnString_ = function(type) {
  if (type in goog.events.onStringMap_) {
    return goog.events.onStringMap_[type];
  }
  return goog.events.onStringMap_[type] = goog.events.onString_ + type;
};


/**
 * Fires an object's listeners of a particular type and phase
 *
 * @param {Object} obj Object whose listeners to call.
 * @param {string} type Event type.
 * @param {boolean} capture Which event phase.
 * @param {Object} eventObject Event object to be passed to listener.
 * @return {boolean} True if all listeners returned true else false.
 */
goog.events.fireListeners = function(obj, type, capture, eventObject) {
  var map = goog.events.listenerTree_;
  if (type in map) {
    map = map[type];
    if (capture in map) {
      return goog.events.fireListeners_(map[capture], obj, type,
                                        capture, eventObject);
    }
  }
  return true;
};


/**
 * Fires an object's listeners of a particular type and phase.
 *
 * @param {Object} map Object with listeners in it.
 * @param {Object} obj Object whose listeners to call.
 * @param {string} type Event type.
 * @param {boolean} capture Which event phase.
 * @param {Object} eventObject Event object to be passed to listener.
 * @return {boolean} True if all listeners returned true else false.
 * @private
 */
goog.events.fireListeners_ = function(map, obj, type, capture, eventObject) {
  var retval = 1;

  var objUid = goog.getUid(obj);
  if (map[objUid]) {
    map.remaining_--;
    var listenerArray = map[objUid];

    // If locked_ is not set (and if already 0) initialize it to 1.
    if (!listenerArray.locked_) {
      listenerArray.locked_ = 1;
    } else {
      listenerArray.locked_++;
    }

    try {
      // Events added in the dispatch phase should not be dispatched in
      // the current dispatch phase. They will be included in the next
      // dispatch phase though.
      var length = listenerArray.length;
      for (var i = 0; i < length; i++) {
        var listener = listenerArray[i];
        // We might not have a listener if the listener was removed.
        if (listener && !listener.removed) {
          retval &=
              goog.events.fireListener(listener, eventObject) !== false;
        }
      }
    } finally {
      listenerArray.locked_--;
      goog.events.cleanUp_(type, capture, objUid, listenerArray);
    }
  }

  return Boolean(retval);
};


/**
 * Fires a listener with a set of arguments
 *
 * @param {goog.events.Listener} listener The listener object to call.
 * @param {Object} eventObject The event object to pass to the listener.
 * @return {boolean} Result of listener.
 */
goog.events.fireListener = function(listener, eventObject) {
  var rv = listener.handleEvent(eventObject);
  if (listener.callOnce) {
    goog.events.unlistenByKey(listener.key);
  }
  return rv;
};


/**
 * Gets the total number of listeners currently in the system.
 * @return {number} Number of listeners.
 */
goog.events.getTotalListenerCount = function() {
  return goog.object.getCount(goog.events.listeners_);
};


/**
 * Dispatches an event (or event like object) and calls all listeners
 * listening for events of this type. The type of the event is decided by the
 * type property on the event object.
 *
 * If any of the listeners returns false OR calls preventDefault then this
 * function will return false.  If one of the capture listeners calls
 * stopPropagation, then the bubble listeners won't fire.
 *
 * @param {goog.events.EventTarget} src  The event target.
 * @param {string|Object|goog.events.Event} e Event object.
 * @return {boolean} If anyone called preventDefault on the event object (or
 *     if any of the handlers returns false) this will also return false.
 *     If there are no handlers, or if all handlers return true, this returns
 *     true.
 */
goog.events.dispatchEvent = function(src, e) {
  var type = e.type || e;
  var map = goog.events.listenerTree_;
  if (!(type in map)) {
    return true;
  }

  // If accepting a string or object, create a custom event object so that
  // preventDefault and stopPropagation work with the event.
  if (goog.isString(e)) {
    e = new goog.events.Event(e, src);
  } else if (!(e instanceof goog.events.Event)) {
    var oldEvent = e;
    e = new goog.events.Event(type, src);
    goog.object.extend(e, oldEvent);
  } else {
    e.target = e.target || src;
  }

  var rv = 1, ancestors;

  map = map[type];
  var hasCapture = true in map;
  var targetsMap;

  if (hasCapture) {
    // Build ancestors now
    ancestors = [];
    for (var parent = src; parent; parent = parent.getParentEventTarget()) {
      ancestors.push(parent);
    }

    targetsMap = map[true];
    targetsMap.remaining_ = targetsMap.count_;

    // Call capture listeners
    for (var i = ancestors.length - 1;
         !e.propagationStopped_ && i >= 0 && targetsMap.remaining_;
         i--) {
      e.currentTarget = ancestors[i];
      rv &= goog.events.fireListeners_(targetsMap, ancestors[i], e.type,
                                       true, e) &&
            e.returnValue_ != false;
    }
  }

  var hasBubble = false in map;
  if (hasBubble) {
    targetsMap = map[false];
    targetsMap.remaining_ = targetsMap.count_;

    if (hasCapture) { // We have the ancestors.

      // Call bubble listeners
      for (var i = 0; !e.propagationStopped_ && i < ancestors.length &&
           targetsMap.remaining_;
           i++) {
        e.currentTarget = ancestors[i];
        rv &= goog.events.fireListeners_(targetsMap, ancestors[i], e.type,
                                         false, e) &&
              e.returnValue_ != false;
      }
    } else {
      // In case we don't have capture we don't have to build up the
      // ancestors array.

      for (var current = src;
           !e.propagationStopped_ && current && targetsMap.remaining_;
           current = current.getParentEventTarget()) {
        e.currentTarget = current;
        rv &= goog.events.fireListeners_(targetsMap, current, e.type,
                                         false, e) &&
              e.returnValue_ != false;
      }
    }
  }

  return Boolean(rv);
};


/**
 * Installs exception protection for the browser event entry point using the
 * given error handler.
 *
 * @param {goog.debug.ErrorHandler} errorHandler Error handler with which to
 *     protect the entry point.
 */
goog.events.protectBrowserEventEntryPoint = function(errorHandler) {
  goog.events.handleBrowserEvent_ = errorHandler.protectEntryPoint(
      goog.events.handleBrowserEvent_);
};


/**
 * Handles an event and dispatches it to the correct listeners. This
 * function is a proxy for the real listener the user specified.
 *
 * @param {number} key Unique key for the listener.
 * @param {Event=} opt_evt Optional event object that gets passed in via the
 *     native event handlers.
 * @return {boolean} Result of the event handler.
 * @this {goog.events.EventTarget|Object} The object or Element that
 *     fired the event.
 * @private
 */
goog.events.handleBrowserEvent_ = function(key, opt_evt) {
  // If the listener isn't there it was probably removed when processing
  // another listener on the same event (e.g. the later listener is
  // not managed by closure so that they are both fired under IE)
  if (!goog.events.listeners_[key]) {
    return true;
  }

  var listener = goog.events.listeners_[key];
  var type = listener.type;
  var map = goog.events.listenerTree_;

  if (!(type in map)) {
    return true;
  }
  map = map[type];
  var retval, targetsMap;
  // Synthesize event propagation if the browser does not support W3C
  // event model.
  if (!goog.events.BrowserFeature.HAS_W3C_EVENT_SUPPORT) {
    var ieEvent = opt_evt ||
        /** @type {Event} */ (goog.getObjectByName('window.event'));

    // Check if we have any capturing event listeners for this type.
    var hasCapture = true in map;
    var hasBubble = false in map;

    if (hasCapture) {
      if (goog.events.isMarkedIeEvent_(ieEvent)) {
        return true;
      }

      goog.events.markIeEvent_(ieEvent);
    }

    var evt = new goog.events.BrowserEvent();
    evt.init(ieEvent, this);

    retval = true;
    try {
      if (hasCapture) {
        var ancestors = [];

        for (var parent = evt.currentTarget;
             parent;
             parent = parent.parentNode) {
          ancestors.push(parent);
        }

        targetsMap = map[true];
        targetsMap.remaining_ = targetsMap.count_;

        // Call capture listeners
        for (var i = ancestors.length - 1;
             !evt.propagationStopped_ && i >= 0 && targetsMap.remaining_;
             i--) {
          evt.currentTarget = ancestors[i];
          retval &= goog.events.fireListeners_(targetsMap, ancestors[i], type,
                                               true, evt);
        }

        if (hasBubble) {
          targetsMap = map[false];
          targetsMap.remaining_ = targetsMap.count_;

          // Call bubble listeners
          for (var i = 0;
               !evt.propagationStopped_ && i < ancestors.length &&
               targetsMap.remaining_;
               i++) {
            evt.currentTarget = ancestors[i];
            retval &= goog.events.fireListeners_(targetsMap, ancestors[i], type,
                                                 false, evt);
          }
        }

      } else {
        // Bubbling, let IE handle the propagation.
        retval = goog.events.fireListener(listener, evt);
      }

    } finally {
      if (ancestors) {
        ancestors.length = 0;
      }
      evt.dispose();
    }
    return retval;
  } // IE

  // Caught a non-IE DOM event. 1 additional argument which is the event object
  var be = new goog.events.BrowserEvent(opt_evt, this);
  try {
    retval = goog.events.fireListener(listener, be);
  } finally {
    be.dispose();
  }
  return retval;
};


/**
 * This is used to mark the IE event object so we do not do the Closure pass
 * twice for a bubbling event.
 * @param {Event} e The IE browser event.
 * @private
 */
goog.events.markIeEvent_ = function(e) {
  // Only the keyCode and the returnValue can be changed. We use keyCode for
  // non keyboard events.
  // event.returnValue is a bit more tricky. It is undefined by default. A
  // boolean false prevents the default action. In a window.onbeforeunload and
  // the returnValue is non undefined it will be alerted. However, we will only
  // modify the returnValue for keyboard events. We can get a problem if non
  // closure events sets the keyCode or the returnValue

  var useReturnValue = false;

  if (e.keyCode == 0) {
    // We cannot change the keyCode in case that srcElement is input[type=file].
    // We could test that that is the case but that would allocate 3 objects.
    // If we use try/catch we will only allocate extra objects in the case of a
    // failure.
    /** @preserveTry */
    try {
      e.keyCode = -1;
      return;
    } catch (ex) {
      useReturnValue = true;
    }
  }

  if (useReturnValue ||
      /** @type {boolean|undefined} */ (e.returnValue) == undefined) {
    e.returnValue = true;
  }
};


/**
 * This is used to check if an IE event has already been handled by the Closure
 * system so we do not do the Closure pass twice for a bubbling event.
 * @param {Event} e  The IE browser event.
 * @return {boolean} True if the event object has been marked.
 * @private
 */
goog.events.isMarkedIeEvent_ = function(e) {
  return e.keyCode < 0 || e.returnValue != undefined;
};


/**
 * Counter to create unique event ids.
 * @type {number}
 * @private
 */
goog.events.uniqueIdCounter_ = 0;


/**
 * Creates a unique event id.
 *
 * @param {string} identifier The identifier.
 * @return {string} A unique identifier.
 */
goog.events.getUniqueId = function(identifier) {
  return identifier + '_' + goog.events.uniqueIdCounter_++;
};


// Register the browser event handler as an entry point, so that
// it can be monitored for exception handling, etc.
goog.debug.entryPointRegistry.register(
    /**
     * @param {function(!Function): !Function} transformer The transforming
     *     function.
     */
    function(transformer) {
      goog.events.handleBrowserEvent_ = transformer(
          goog.events.handleBrowserEvent_);
    });
// Copyright 2005 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Implementation of EventTarget as defined by W3C DOM 2/3.
 *
 * @author arv@google.com (Erik Arvidsson) [Original implementation]
 * @author pupius@google.com (Daniel Pupius) [Port to use goog.events]
 * @see ../demos/eventtarget.html
 */


/**
 * Namespace for events
 */
goog.provide('goog.events.EventTarget');

goog.require('goog.Disposable');
goog.require('goog.events');



/**
 * Inherit from this class to give your object the ability to dispatch events.
 * Note that this class provides event <em>sending</em> behaviour, not event
 * receiving behaviour: your object will be able to broadcast events, and other
 * objects will be able to listen for those events using goog.events.listen().
 *
 * <p>The name "EventTarget" reflects the fact that this class implements the
 * <a href="http://www.w3.org/TR/DOM-Level-2-Events/events.html">
 * EventTarget interface</a> as defined by W3C DOM 2/3, with a few differences:
 * <ul>
 * <li>Event objects do not have to implement the Event interface. An object
 *     is treated as an event object if it has a 'type' property.
 * <li>You can use a plain string instead of an event object; an event-like
 *     object will be created with the 'type' set to the string value.
 * </ul>
 *
 * <p>Unless propagation is stopped, an event dispatched by an EventTarget
 * will bubble to the parent returned by <code>getParentEventTarget</code>.
 * To set the parent, call <code>setParentEventTarget</code> or override
 * <code>getParentEventTarget</code> in a subclass.  Subclasses that don't
 * support changing the parent should override the setter to throw an error.
 *
 * <p>Example usage:
 * <pre>
 *   var source = new goog.events.EventTarget();
 *   function handleEvent(event) {
 *     alert('Type: ' + e.type + '\nTarget: ' + e.target);
 *   }
 *   goog.events.listen(source, 'foo', handleEvent);
 *   ...
 *   source.dispatchEvent({type: 'foo'}); // will call handleEvent
 *   // or source.dispatchEvent('foo');
 *   ...
 *   goog.events.unlisten(source, 'foo', handleEvent);
 *
 *   // You can also use the Listener interface:
 *   var listener = {
 *     handleEvent: function(event) {
 *       ...
 *     }
 *   };
 *   goog.events.listen(source, 'bar', listener);
 * </pre>
 *
 * @constructor
 * @extends {goog.Disposable}
 */
goog.events.EventTarget = function() {
  goog.Disposable.call(this);
};
goog.inherits(goog.events.EventTarget, goog.Disposable);


/**
 * Used to tell if an event is a real event in goog.events.listen() so we don't
 * get listen() calling addEventListener() and vice-versa.
 * @type {boolean}
 * @private
 */
goog.events.EventTarget.prototype.customEvent_ = true;


/**
 * Parent event target, used during event bubbling.
 * @type {goog.events.EventTarget?}
 * @private
 */
goog.events.EventTarget.prototype.parentEventTarget_ = null;


/**
 * Returns the parent of this event target to use for bubbling.
 *
 * @return {goog.events.EventTarget} The parent EventTarget or null if there
 * is no parent.
 */
goog.events.EventTarget.prototype.getParentEventTarget = function() {
  return this.parentEventTarget_;
};


/**
 * Sets the parent of this event target to use for bubbling.
 *
 * @param {goog.events.EventTarget?} parent Parent EventTarget (null if none).
 */
goog.events.EventTarget.prototype.setParentEventTarget = function(parent) {
  this.parentEventTarget_ = parent;
};


/**
 * Adds an event listener to the event target. The same handler can only be
 * added once per the type. Even if you add the same handler multiple times
 * using the same type then it will only be called once when the event is
 * dispatched.
 *
 * Supported for legacy but use goog.events.listen(src, type, handler) instead.
 *
 * @param {string} type The type of the event to listen for.
 * @param {Function|Object} handler The function to handle the event. The
 *     handler can also be an object that implements the handleEvent method
 *     which takes the event object as argument.
 * @param {boolean=} opt_capture In DOM-compliant browsers, this determines
 *     whether the listener is fired during the capture or bubble phase
 *     of the event.
 * @param {Object=} opt_handlerScope Object in whose scope to call the listener.
 */
goog.events.EventTarget.prototype.addEventListener = function(
    type, handler, opt_capture, opt_handlerScope) {
  goog.events.listen(this, type, handler, opt_capture, opt_handlerScope);
};


/**
 * Removes an event listener from the event target. The handler must be the
 * same object as the one added. If the handler has not been added then
 * nothing is done.
 * @param {string} type The type of the event to listen for.
 * @param {Function|Object} handler The function to handle the event. The
 *     handler can also be an object that implements the handleEvent method
 *     which takes the event object as argument.
 * @param {boolean=} opt_capture In DOM-compliant browsers, this determines
 *     whether the listener is fired during the capture or bubble phase
 *     of the event.
 * @param {Object=} opt_handlerScope Object in whose scope to call the listener.
 */
goog.events.EventTarget.prototype.removeEventListener = function(
    type, handler, opt_capture, opt_handlerScope) {
  goog.events.unlisten(this, type, handler, opt_capture, opt_handlerScope);
};


/**
 * Dispatches an event (or event like object) and calls all listeners
 * listening for events of this type. The type of the event is decided by the
 * type property on the event object.
 *
 * If any of the listeners returns false OR calls preventDefault then this
 * function will return false.  If one of the capture listeners calls
 * stopPropagation, then the bubble listeners won't fire.
 *
 * @param {string|Object|goog.events.Event} e Event object.
 * @return {boolean} If anyone called preventDefault on the event object (or
 *     if any of the handlers returns false this will also return false.
 */
goog.events.EventTarget.prototype.dispatchEvent = function(e) {
  return goog.events.dispatchEvent(this, e);
};


/**
 * Unattach listeners from this object.  Classes that extend EventTarget may
 * need to override this method in order to remove references to DOM Elements
 * and additional listeners, it should be something like this:
 * <pre>
 * MyClass.prototype.disposeInternal = function() {
 *   MyClass.superClass_.disposeInternal.call(this);
 *   // Dispose logic for MyClass
 * };
 * </pre>
 * @override
 * @protected
 */
goog.events.EventTarget.prototype.disposeInternal = function() {
  goog.events.EventTarget.superClass_.disposeInternal.call(this);
  goog.events.removeAll(this);
  this.parentEventTarget_ = null;
};
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview A timer class to which other classes and objects can
 * listen on.  This is only an abstraction above setInterval.
 *
 * @see ../demos/timers.html
 */

goog.provide('goog.Timer');

goog.require('goog.events.EventTarget');



/**
 * Class for handling timing events.
 *
 * @param {number=} opt_interval Number of ms between ticks (Default: 1ms).
 * @param {Object=} opt_timerObject  An object that has setTimeout, setInterval,
 *     clearTimeout and clearInterval (eg Window).
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.Timer = function(opt_interval, opt_timerObject) {
  goog.events.EventTarget.call(this);

  /**
   * Number of ms between ticks
   * @type {number}
   * @private
   */
  this.interval_ = opt_interval || 1;

  /**
   * An object that implements setTimout, setInterval, clearTimeout and
   * clearInterval. We default to the window object. Changing this on
   * goog.Timer.prototype changes the object for all timer instances which can
   * be useful if your environment has some other implementation of timers than
   * the window object.
   * @type {Object}
   * @private
   */
  this.timerObject_ = opt_timerObject || goog.Timer.defaultTimerObject;

  /**
   * Cached tick_ bound to the object for later use in the timer.
   * @type {Function}
   * @private
   */
  this.boundTick_ = goog.bind(this.tick_, this);

 /**
  * Firefox browser often fires the timer event sooner
  * (sometimes MUCH sooner) than the requested timeout. So we
  * compare the time to when the event was last fired, and
  * reschedule if appropriate. See also goog.Timer.intervalScale
  * @type {number}
  * @private
  */
  this.last_ = goog.now();
};
goog.inherits(goog.Timer, goog.events.EventTarget);


/**
 * Maximum timeout value.
 *
 * Timeout values too big to fit into a signed 32-bit integer may cause
 * overflow in FF, Safari, and Chrome, resulting in the timeout being
 * scheduled immediately.  It makes more sense simply not to schedule these
 * timeouts, since 24.8 days is beyond a reasonable expectation for the
 * browser to stay open.
 *
 * @type {number}
 * @private
 */
goog.Timer.MAX_TIMEOUT_ = 2147483647;


/**
 * Whether this timer is enabled
 * @type {boolean}
 */
goog.Timer.prototype.enabled = false;


/**
 * An object that implements setTimout, setInterval, clearTimeout and
 * clearInterval. We default to the window object. Changing this on
 * goog.Timer.prototype changes the object for all timer instances which can be
 * useful if your environment has some other implementation of timers than the
 * window object.
 * @type {Object}
 */
goog.Timer.defaultTimerObject = goog.global['window'];


/**
 * A variable that controls the timer error correction. If the
 * timer is called before the requested interval times
 * intervalScale, which often happens on mozilla, the timer is
 * rescheduled. See also this.last_
 * @type {number}
 */
goog.Timer.intervalScale = 0.8;


/**
 * Variable for storing the result of setInterval
 * @type {?number}
 * @private
 */
goog.Timer.prototype.timer_ = null;


/**
 * Gets the interval of the timer.
 * @return {number} interval Number of ms between ticks.
 */
goog.Timer.prototype.getInterval = function() {
  return this.interval_;
};


/**
 * Sets the interval of the timer.
 * @param {number} interval Number of ms between ticks.
 */
goog.Timer.prototype.setInterval = function(interval) {
  this.interval_ = interval;
  if (this.timer_ && this.enabled) {
    // Stop and then start the timer to reset the interval.
    this.stop();
    this.start();
  } else if (this.timer_) {
    this.stop();
  }
};


/**
 * Callback for the setTimeout used by the timer
 * @private
 */
goog.Timer.prototype.tick_ = function() {
  if (this.enabled) {
    var elapsed = goog.now() - this.last_;
    if (elapsed > 0 &&
        elapsed < this.interval_ * goog.Timer.intervalScale) {
      this.timer_ = this.timerObject_.setTimeout(this.boundTick_,
          this.interval_ - elapsed);
      return;
    }

    this.dispatchTick();
    // The timer could be stopped in the timer event handler.
    if (this.enabled) {
      this.timer_ = this.timerObject_.setTimeout(this.boundTick_,
          this.interval_);
      this.last_ = goog.now();
    }
  }
};


/**
 * Dispatches the TICK event. This is its own method so subclasses can override.
 */
goog.Timer.prototype.dispatchTick = function() {
  this.dispatchEvent(goog.Timer.TICK);
};


/**
 * Starts the timer.
 */
goog.Timer.prototype.start = function() {
  this.enabled = true;

  // If there is no interval already registered, start it now
  if (!this.timer_) {
    // IMPORTANT!
    // window.setInterval in FireFox has a bug - it fires based on
    // absolute time, rather than on relative time. What this means
    // is that if a computer is sleeping/hibernating for 24 hours
    // and the timer interval was configured to fire every 1000ms,
    // then after the PC wakes up the timer will fire, in rapid
    // succession, 3600*24 times.
    // This bug is described here and is already fixed, but it will
    // take time to propagate, so for now I am switching this over
    // to setTimeout logic.
    //     https://bugzilla.mozilla.org/show_bug.cgi?id=376643
    //
    this.timer_ = this.timerObject_.setTimeout(this.boundTick_,
        this.interval_);
    this.last_ = goog.now();
  }
};


/**
 * Stops the timer.
 */
goog.Timer.prototype.stop = function() {
  this.enabled = false;
  if (this.timer_) {
    this.timerObject_.clearTimeout(this.timer_);
    this.timer_ = null;
  }
};


/** @override */
goog.Timer.prototype.disposeInternal = function() {
  goog.Timer.superClass_.disposeInternal.call(this);
  this.stop();
  delete this.timerObject_;
};


/**
 * Constant for the timer's event type
 * @type {string}
 */
goog.Timer.TICK = 'tick';


/**
 * Calls the given function once, after the optional pause.
 *
 * The function is always called asynchronously, even if the delay is 0. This
 * is a common trick to schedule a function to run after a batch of browser
 * event processing.
 *
 * @param {Function} listener Function or object that has a handleEvent method.
 * @param {number=} opt_delay Milliseconds to wait; default is 0.
 * @param {Object=} opt_handler Object in whose scope to call the listener.
 * @return {number} A handle to the timer ID.
 */
goog.Timer.callOnce = function(listener, opt_delay, opt_handler) {
  if (goog.isFunction(listener)) {
    if (opt_handler) {
      listener = goog.bind(listener, opt_handler);
    }
  } else if (listener && typeof listener.handleEvent == 'function') {
    // using typeof to prevent strict js warning
    listener = goog.bind(listener.handleEvent, listener);
  } else {
   throw Error('Invalid listener argument');
  }

  if (opt_delay > goog.Timer.MAX_TIMEOUT_) {
    // Timeouts greater than MAX_INT return immediately due to integer
    // overflow in many browsers.  Since MAX_INT is 24.8 days, just don't
    // schedule anything at all.
    return -1;
  } else {
    return goog.Timer.defaultTimerObject.setTimeout(
        listener, opt_delay || 0);
  }
};


/**
 * Clears a timeout initiated by callOnce
 * @param {?number} timerId a timer ID.
 */
goog.Timer.clear = function(timerId) {
  goog.Timer.defaultTimerObject.clearTimeout(timerId);
};
// Copyright 2007 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Python style iteration utilities.
 * @author arv@google.com (Erik Arvidsson)
 */


goog.provide('goog.iter');
goog.provide('goog.iter.Iterator');
goog.provide('goog.iter.StopIteration');

goog.require('goog.array');
goog.require('goog.asserts');


// TODO(nnaze): Add more functions from Python's itertools.
// http://docs.python.org/library/itertools.html


/**
 * @typedef {goog.iter.Iterator|{length:number}|{__iterator__}}
 */
goog.iter.Iterable;


// For script engines that already support iterators.
if ('StopIteration' in goog.global) {
  /**
   * Singleton Error object that is used to terminate iterations.
   * @type {Error}
   */
  goog.iter.StopIteration = goog.global['StopIteration'];
} else {
  /**
   * Singleton Error object that is used to terminate iterations.
   * @type {Error}
   * @suppress {duplicate}
   */
  goog.iter.StopIteration = Error('StopIteration');
}



/**
 * Class/interface for iterators.  An iterator needs to implement a {@code next}
 * method and it needs to throw a {@code goog.iter.StopIteration} when the
 * iteration passes beyond the end.  Iterators have no {@code hasNext} method.
 * It is recommended to always use the helper functions to iterate over the
 * iterator or in case you are only targeting JavaScript 1.7 for in loops.
 * @constructor
 */
goog.iter.Iterator = function() {};


/**
 * Returns the next value of the iteration.  This will throw the object
 * {@see goog.iter#StopIteration} when the iteration passes the end.
 * @return {*} Any object or value.
 */
goog.iter.Iterator.prototype.next = function() {
  throw goog.iter.StopIteration;
};


/**
 * Returns the {@code Iterator} object itself.  This is used to implement
 * the iterator protocol in JavaScript 1.7
 * @param {boolean=} opt_keys  Whether to return the keys or values. Default is
 *     to only return the values.  This is being used by the for-in loop (true)
 *     and the for-each-in loop (false).  Even though the param gives a hint
 *     about what the iterator will return there is no guarantee that it will
 *     return the keys when true is passed.
 * @return {!goog.iter.Iterator} The object itself.
 */
goog.iter.Iterator.prototype.__iterator__ = function(opt_keys) {
  return this;
};


/**
 * Returns an iterator that knows how to iterate over the values in the object.
 * @param {goog.iter.Iterable} iterable  If the object is an iterator it
 *     will be returned as is.  If the object has a {@code __iterator__} method
 *     that will be called to get the value iterator.  If the object is an
 *     array-like object we create an iterator for that.
 * @return {!goog.iter.Iterator} An iterator that knows how to iterate over the
 *     values in {@code iterable}.
 */
goog.iter.toIterator = function(iterable) {
  if (iterable instanceof goog.iter.Iterator) {
    return iterable;
  }
  if (typeof iterable.__iterator__ == 'function') {
    return iterable.__iterator__(false);
  }
  if (goog.isArrayLike(iterable)) {
    var i = 0;
    var newIter = new goog.iter.Iterator;
    newIter.next = function() {
      while (true) {
        if (i >= iterable.length) {
          throw goog.iter.StopIteration;
        }
        // Don't include deleted elements.
        if (!(i in iterable)) {
          i++;
          continue;
        }
        return iterable[i++];
      }
    };
    return newIter;
  }


  // TODO(arv): Should we fall back on goog.structs.getValues()?
  throw Error('Not implemented');
};


/**
 * Calls a function for each element in the iterator with the element of the
 * iterator passed as argument.
 *
 * @param {goog.iter.Iterable} iterable  The iterator to iterate
 *     over.  If the iterable is an object {@code toIterator} will be called on
 *     it.
 * @param {Function} f  The function to call for every element.  This function
 *     takes 3 arguments (the element, undefined, and the iterator) and the
 *     return value is irrelevant.  The reason for passing undefined as the
 *     second argument is so that the same function can be used in
 *     {@see goog.array#forEach} as well as others.
 * @param {Object=} opt_obj  The object to be used as the value of 'this' within
 *     {@code f}.
 */
goog.iter.forEach = function(iterable, f, opt_obj) {
  if (goog.isArrayLike(iterable)) {
    /** @preserveTry */
    try {
      goog.array.forEach((/** @type {goog.array.ArrayLike} */ iterable), f,
                         opt_obj);
    } catch (ex) {
      if (ex !== goog.iter.StopIteration) {
        throw ex;
      }
    }
  } else {
    iterable = goog.iter.toIterator(iterable);
    /** @preserveTry */
    try {
      while (true) {
        f.call(opt_obj, iterable.next(), undefined, iterable);
      }
    } catch (ex) {
      if (ex !== goog.iter.StopIteration) {
        throw ex;
      }
    }
  }
};


/**
 * Calls a function for every element in the iterator, and if the function
 * returns true adds the element to a new iterator.
 *
 * @param {goog.iter.Iterable} iterable The iterator to iterate over.
 * @param {Function} f The function to call for every element.  This function
 *     takes 3 arguments (the element, undefined, and the iterator) and should
 *     return a boolean.  If the return value is true the element will be
 *     included  in the returned iteror.  If it is false the element is not
 *     included.
 * @param {Object=} opt_obj The object to be used as the value of 'this' within
 *     {@code f}.
 * @return {!goog.iter.Iterator} A new iterator in which only elements that
 *     passed the test are present.
 */
goog.iter.filter = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    while (true) {
      var val = iterable.next();
      if (f.call(opt_obj, val, undefined, iterable)) {
        return val;
      }
    }
  };
  return newIter;
};


/**
 * Creates a new iterator that returns the values in a range.  This function
 * can take 1, 2 or 3 arguments:
 * <pre>
 * range(5) same as range(0, 5, 1)
 * range(2, 5) same as range(2, 5, 1)
 * </pre>
 *
 * @param {number} startOrStop  The stop value if only one argument is provided.
 *     The start value if 2 or more arguments are provided.  If only one
 *     argument is used the start value is 0.
 * @param {number=} opt_stop  The stop value.  If left out then the first
 *     argument is used as the stop value.
 * @param {number=} opt_step  The number to increment with between each call to
 *     next.  This can be negative.
 * @return {!goog.iter.Iterator} A new iterator that returns the values in the
 *     range.
 */
goog.iter.range = function(startOrStop, opt_stop, opt_step) {
  var start = 0;
  var stop = startOrStop;
  var step = opt_step || 1;
  if (arguments.length > 1) {
    start = startOrStop;
    stop = opt_stop;
  }
  if (step == 0) {
    throw Error('Range step argument must not be zero');
  }

  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    if (step > 0 && start >= stop || step < 0 && start <= stop) {
      throw goog.iter.StopIteration;
    }
    var rv = start;
    start += step;
    return rv;
  };
  return newIter;
};


/**
 * Joins the values in a iterator with a delimiter.
 * @param {goog.iter.Iterable} iterable  The iterator to get the values from.
 * @param {string} deliminator  The text to put between the values.
 * @return {string} The joined value string.
 */
goog.iter.join = function(iterable, deliminator) {
  return goog.iter.toArray(iterable).join(deliminator);
};


/**
 * For every element in the iterator call a function and return a new iterator
 * with that value.
 *
 * @param {goog.iter.Iterable} iterable The iterator to iterate over.
 * @param {Function} f The function to call for every element.  This function
 *     takes 3 arguments (the element, undefined, and the iterator) and should
 *     return a new value.
 * @param {Object=} opt_obj The object to be used as the value of 'this' within
 *     {@code f}.
 * @return {!goog.iter.Iterator} A new iterator that returns the results of
 *     applying the function to each element in the original iterator.
 */
goog.iter.map = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    while (true) {
      var val = iterable.next();
      return f.call(opt_obj, val, undefined, iterable);
    }
  };
  return newIter;
};


/**
 * Passes every element of an iterator into a function and accumulates the
 * result.
 *
 * @param {goog.iter.Iterable} iterable The iterator to iterate over.
 * @param {Function} f The function to call for every element. This function
 *     takes 2 arguments (the function's previous result or the initial value,
 *     and the value of the current element).
 *     function(previousValue, currentElement) : newValue.
 * @param {*} val The initial value to pass into the function on the first call.
 * @param {Object=} opt_obj  The object to be used as the value of 'this'
 *     within f.
 * @return {*} Result of evaluating f repeatedly across the values of
 *     the iterator.
 */
goog.iter.reduce = function(iterable, f, val, opt_obj) {
  var rval = val;
  goog.iter.forEach(iterable, function(val) {
    rval = f.call(opt_obj, rval, val);
  });
  return rval;
};


/**
 * Goes through the values in the iterator. Calls f for each these and if any of
 * them returns true, this returns true (without checking the rest). If all
 * return false this will return false.
 *
 * @param {goog.iter.Iterable} iterable  The iterator object.
 * @param {Function} f  The function to call for every value. This function
 *     takes 3 arguments (the value, undefined, and the iterator) and should
 *     return a boolean.
 * @param {Object=} opt_obj The object to be used as the value of 'this' within
 *     {@code f}.
 * @return {boolean} true if any value passes the test.
 */
goog.iter.some = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  /** @preserveTry */
  try {
    while (true) {
      if (f.call(opt_obj, iterable.next(), undefined, iterable)) {
        return true;
      }
    }
  } catch (ex) {
    if (ex !== goog.iter.StopIteration) {
      throw ex;
    }
  }
  return false;
};


/**
 * Goes through the values in the iterator. Calls f for each these and if any of
 * them returns false this returns false (without checking the rest). If all
 * return true this will return true.
 *
 * @param {goog.iter.Iterable} iterable  The iterator object.
 * @param {Function} f  The function to call for every value. This function
 *     takes 3 arguments (the value, undefined, and the iterator) and should
 *     return a boolean.
 * @param {Object=} opt_obj The object to be used as the value of 'this' within
 *     {@code f}.
 * @return {boolean} true if every value passes the test.
 */
goog.iter.every = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  /** @preserveTry */
  try {
    while (true) {
      if (!f.call(opt_obj, iterable.next(), undefined, iterable)) {
        return false;
      }
    }
  } catch (ex) {
    if (ex !== goog.iter.StopIteration) {
      throw ex;
    }
  }
  return true;
};


/**
 * Takes zero or more iterators and returns one iterator that will iterate over
 * them in the order chained.
 * @param {...goog.iter.Iterator} var_args  Any number of iterator objects.
 * @return {!goog.iter.Iterator} Returns a new iterator that will iterate over
 *     all the given iterators' contents.
 */
goog.iter.chain = function(var_args) {
  var args = arguments;
  var length = args.length;
  var i = 0;
  var newIter = new goog.iter.Iterator;

  /**
   * @return {*} The next item in the iteration.
   * @this {goog.iter.Iterator}
   */
  newIter.next = function() {
    /** @preserveTry */
    try {
      if (i >= length) {
        throw goog.iter.StopIteration;
      }
      var current = goog.iter.toIterator(args[i]);
      return current.next();
    } catch (ex) {
      if (ex !== goog.iter.StopIteration || i >= length) {
        throw ex;
      } else {
        // In case we got a StopIteration increment counter and try again.
        i++;
        return this.next();
      }
    }
  };

  return newIter;
};


/**
 * Builds a new iterator that iterates over the original, but skips elements as
 * long as a supplied function returns true.
 * @param {goog.iter.Iterable} iterable  The iterator object.
 * @param {Function} f  The function to call for every value. This function
 *     takes 3 arguments (the value, undefined, and the iterator) and should
 *     return a boolean.
 * @param {Object=} opt_obj The object to be used as the value of 'this' within
 *     {@code f}.
 * @return {!goog.iter.Iterator} A new iterator that drops elements from the
 *     original iterator as long as {@code f} is true.
 */
goog.iter.dropWhile = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  var dropping = true;
  newIter.next = function() {
    while (true) {
      var val = iterable.next();
      if (dropping && f.call(opt_obj, val, undefined, iterable)) {
        continue;
      } else {
        dropping = false;
      }
      return val;
    }
  };
  return newIter;
};


/**
 * Builds a new iterator that iterates over the original, but only as long as a
 * supplied function returns true.
 * @param {goog.iter.Iterable} iterable  The iterator object.
 * @param {Function} f  The function to call for every value. This function
 *     takes 3 arguments (the value, undefined, and the iterator) and should
 *     return a boolean.
 * @param {Object=} opt_obj This is used as the 'this' object in f when called.
 * @return {!goog.iter.Iterator} A new iterator that keeps elements in the
 *     original iterator as long as the function is true.
 */
goog.iter.takeWhile = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  var taking = true;
  newIter.next = function() {
    while (true) {
      if (taking) {
        var val = iterable.next();
        if (f.call(opt_obj, val, undefined, iterable)) {
          return val;
        } else {
          taking = false;
        }
      } else {
        throw goog.iter.StopIteration;
      }
    }
  };
  return newIter;
};


/**
 * Converts the iterator to an array
 * @param {goog.iter.Iterable} iterable  The iterator to convert to an array.
 * @return {!Array} An array of the elements the iterator iterates over.
 */
goog.iter.toArray = function(iterable) {
  // Fast path for array-like.
  if (goog.isArrayLike(iterable)) {
    return goog.array.toArray((/** @type {!goog.array.ArrayLike} */ iterable));
  }
  iterable = goog.iter.toIterator(iterable);
  var array = [];
  goog.iter.forEach(iterable, function(val) {
    array.push(val);
  });
  return array;
};


/**
 * Iterates over 2 iterators and returns true if they contain the same sequence
 * of elements and have the same length.
 * @param {goog.iter.Iterable} iterable1  The first iterable object.
 * @param {goog.iter.Iterable} iterable2  The second iterable object.
 * @return {boolean} true if the iterators contain the same sequence of
 *     elements and have the same length.
 */
goog.iter.equals = function(iterable1, iterable2) {
  iterable1 = goog.iter.toIterator(iterable1);
  iterable2 = goog.iter.toIterator(iterable2);
  var b1, b2;
  /** @preserveTry */
  try {
    while (true) {
      b1 = b2 = false;
      var val1 = iterable1.next();
      b1 = true;
      var val2 = iterable2.next();
      b2 = true;
      if (val1 != val2) {
        return false;
      }
    }
  } catch (ex) {
    if (ex !== goog.iter.StopIteration) {
      throw ex;
    } else {
      if (b1 && !b2) {
        // iterable1 done but iterable2 is not done.
        return false;
      }
      if (!b2) {
        /** @preserveTry */
        try {
          // iterable2 not done?
          val2 = iterable2.next();
          // iterable2 not done but iterable1 is done
          return false;
        } catch (ex1) {
          if (ex1 !== goog.iter.StopIteration) {
            throw ex1;
          }
          // iterable2 done as well... They are equal
          return true;
        }
      }
    }
  }
  return false;
};


/**
 * Advances the iterator to the next position, returning the given default value
 * instead of throwing an exception if the iterator has no more entries.
 * @param {goog.iter.Iterable} iterable The iterable object.
 * @param {*} defaultValue The value to return if the iterator is empty.
 * @return {*} The next item in the iteration, or defaultValue if the iterator
 *     was empty.
 */
goog.iter.nextOrValue = function(iterable, defaultValue) {
  try {
    return goog.iter.toIterator(iterable).next();
  } catch (e) {
    if (e != goog.iter.StopIteration) {
      throw e;
    }
    return defaultValue;
  }
};


/**
 * Cartesian product of zero or more sets.  Gives an iterator that gives every
 * combination of one element chosen from each set.  For example,
 * ([1, 2], [3, 4]) gives ([1, 3], [1, 4], [2, 3], [2, 4]).
 * @see http://docs.python.org/library/itertools.html#itertools.product
 * @param {...!goog.array.ArrayLike.<*>} var_args Zero or more sets, as arrays.
 * @return {!goog.iter.Iterator} An iterator that gives each n-tuple (as an
 *     array).
 */
goog.iter.product = function(var_args) {
  var someArrayEmpty = goog.array.some(arguments, function(arr) {
    return !arr.length;
  });

  // An empty set in a cartesian product gives an empty set.
  if (someArrayEmpty || !arguments.length) {
    return new goog.iter.Iterator();
  }

  var iter = new goog.iter.Iterator();
  var arrays = arguments;

  // The first indicies are [0, 0, ...]
  var indicies = goog.array.repeat(0, arrays.length);

  iter.next = function() {

    if (indicies) {
      var retVal = goog.array.map(indicies, function(valueIndex, arrayIndex) {
        return arrays[arrayIndex][valueIndex];
      });

      // Generate the next-largest indicies for the next call.
      // Increase the rightmost index. If it goes over, increase the next
      // rightmost (like carry-over addition).
      for (var i = indicies.length - 1; i >= 0; i--) {
        // Assertion prevents compiler warning below.
        goog.asserts.assert(indicies);
        if (indicies[i] < arrays[i].length - 1) {
          indicies[i]++;
          break;
        }

        // We're at the last indicies (the last element of every array), so
        // the iteration is over on the next call.
        if (i == 0) {
          indicies = null;
          break;
        }
        // Reset the index in this column and loop back to increment the
        // next one.
        indicies[i] = 0;
      }
      return retVal;
    }

    throw goog.iter.StopIteration;
  };

  return iter;
};


/**
 * Create an iterator to cycle over the iterable's elements indefinitely.
 * For example, ([1, 2, 3]) would return : 1, 2, 3, 1, 2, 3, ...
 * @see: http://docs.python.org/library/itertools.html#itertools.cycle.
 * @param {!goog.iter.Iterable} iterable The iterable object.
 * @return {!goog.iter.Iterator} An iterator that iterates indefinitely over
 * the values in {@code iterable}.
 */
goog.iter.cycle = function(iterable) {

  var baseIterator = goog.iter.toIterator(iterable);

  // We maintain a cache to store the iterable elements as we iterate
  // over them. The cache is used to return elements once we have
  // iterated over the iterable once.
  var cache = [];
  var cacheIndex = 0;

  var iter = new goog.iter.Iterator();

  // This flag is set after the iterable is iterated over once
  var useCache = false;

  iter.next = function() {
    var returnElement = null;

    // Pull elements off the original iterator if not using cache
    if (!useCache) {

      try {
        // Return the element from the iterable
        returnElement = baseIterator.next();
        cache.push(returnElement);
        return returnElement;
      } catch (e) {
        // If an exception other than StopIteration is thrown
        // or if there are no elements to iterate over (the iterable was empty)
        // throw an exception
        if (e != goog.iter.StopIteration || goog.array.isEmpty(cache)) {
          throw e;
        }
        // set useCache to true after we know that a 'StopIteration' exception
        // was thrown and the cache is not empty (to handle the 'empty iterable'
        // use case)
        useCache = true;
      }
    }

    returnElement = cache[cacheIndex];
    cacheIndex = (cacheIndex + 1) % cache.length;

    return returnElement;
  };

  return iter;
};
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Generics method for collection-like classes and objects.
 *
 * @author arv@google.com (Erik Arvidsson)
 *
 * This file contains functions to work with collections. It supports using
 * Map, Set, Array and Object and other classes that implement collection-like
 * methods.
 */


goog.provide('goog.structs');

goog.require('goog.array');
goog.require('goog.object');


// We treat an object as a dictionary if it has getKeys or it is an object that
// isn't arrayLike.


/**
 * Returns the number of values in the collection-like object.
 * @param {Object} col The collection-like object.
 * @return {number} The number of values in the collection-like object.
 */
goog.structs.getCount = function(col) {
  if (typeof col.getCount == 'function') {
    return col.getCount();
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return col.length;
  }
  return goog.object.getCount(col);
};


/**
 * Returns the values of the collection-like object.
 * @param {Object} col The collection-like object.
 * @return {!Array} The values in the collection-like object.
 */
goog.structs.getValues = function(col) {
  if (typeof col.getValues == 'function') {
    return col.getValues();
  }
  if (goog.isString(col)) {
    return col.split('');
  }
  if (goog.isArrayLike(col)) {
    var rv = [];
    var l = col.length;
    for (var i = 0; i < l; i++) {
      rv.push(col[i]);
    }
    return rv;
  }
  return goog.object.getValues(col);
};


/**
 * Returns the keys of the collection. Some collections have no notion of
 * keys/indexes and this function will return undefined in those cases.
 * @param {Object} col The collection-like object.
 * @return {!Array|undefined} The keys in the collection.
 */
goog.structs.getKeys = function(col) {
  if (typeof col.getKeys == 'function') {
    return col.getKeys();
  }
  // if we have getValues but no getKeys we know this is a key-less collection
  if (typeof col.getValues == 'function') {
    return undefined;
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    var rv = [];
    var l = col.length;
    for (var i = 0; i < l; i++) {
      rv.push(i);
    }
    return rv;
  }

  return goog.object.getKeys(col);
};


/**
 * Whether the collection contains the given value. This is O(n) and uses
 * equals (==) to test the existence.
 * @param {Object} col The collection-like object.
 * @param {*} val The value to check for.
 * @return {boolean} True if the map contains the value.
 */
goog.structs.contains = function(col, val) {
  if (typeof col.contains == 'function') {
    return col.contains(val);
  }
  if (typeof col.containsValue == 'function') {
    return col.containsValue(val);
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.contains(/** @type {Array} */ (col), val);
  }
  return goog.object.containsValue(col, val);
};


/**
 * Whether the collection is empty.
 * @param {Object} col The collection-like object.
 * @return {boolean} True if empty.
 */
goog.structs.isEmpty = function(col) {
  if (typeof col.isEmpty == 'function') {
    return col.isEmpty();
  }

  // We do not use goog.string.isEmpty because here we treat the string as
  // collection and as such even whitespace matters

  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.isEmpty(/** @type {Array} */ (col));
  }
  return goog.object.isEmpty(col);
};


/**
 * Removes all the elements from the collection.
 * @param {Object} col The collection-like object.
 */
goog.structs.clear = function(col) {
  // NOTE(arv): This should not contain strings because strings are immutable
  if (typeof col.clear == 'function') {
    col.clear();
  } else if (goog.isArrayLike(col)) {
    goog.array.clear((/** @type {goog.array.ArrayLike} */ col));
  } else {
    goog.object.clear(col);
  }
};


/**
 * Calls a function for each value in a collection. The function takes
 * three arguments; the value, the key and the collection.
 *
 * @param {Object} col The collection-like object.
 * @param {Function} f The function to call for every value. This function takes
 *     3 arguments (the value, the key or undefined if the collection has no
 *     notion of keys, and the collection) and the return value is irrelevant.
 * @param {Object=} opt_obj The object to be used as the value of 'this'
 *     within {@code f}.
 */
goog.structs.forEach = function(col, f, opt_obj) {
  if (typeof col.forEach == 'function') {
    col.forEach(f, opt_obj);
  } else if (goog.isArrayLike(col) || goog.isString(col)) {
    goog.array.forEach(/** @type {Array} */ (col), f, opt_obj);
  } else {
    var keys = goog.structs.getKeys(col);
    var values = goog.structs.getValues(col);
    var l = values.length;
    for (var i = 0; i < l; i++) {
      f.call(opt_obj, values[i], keys && keys[i], col);
    }
  }
};


/**
 * Calls a function for every value in the collection. When a call returns true,
 * adds the value to a new collection (Array is returned by default).
 *
 * @param {Object} col The collection-like object.
 * @param {Function} f The function to call for every value. This function takes
 *     3 arguments (the value, the key or undefined if the collection has no
 *     notion of keys, and the collection) and should return a Boolean. If the
 *     return value is true the value is added to the result collection. If it
 *     is false the value is not included.
 * @param {Object=} opt_obj The object to be used as the value of 'this'
 *     within {@code f}.
 * @return {!Object|!Array} A new collection where the passed values are
 *     present. If col is a key-less collection an array is returned.  If col
 *     has keys and values a plain old JS object is returned.
 */
goog.structs.filter = function(col, f, opt_obj) {
  if (typeof col.filter == 'function') {
    return col.filter(f, opt_obj);
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.filter(/** @type {!Array} */ (col), f, opt_obj);
  }

  var rv;
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  if (keys) {
    rv = {};
    for (var i = 0; i < l; i++) {
      if (f.call(opt_obj, values[i], keys[i], col)) {
        rv[keys[i]] = values[i];
      }
    }
  } else {
    // We should not use goog.array.filter here since we want to make sure that
    // the index is undefined as well as make sure that col is passed to the
    // function.
    rv = [];
    for (var i = 0; i < l; i++) {
      if (f.call(opt_obj, values[i], undefined, col)) {
        rv.push(values[i]);
      }
    }
  }
  return rv;
};


/**
 * Calls a function for every value in the collection and adds the result into a
 * new collection (defaults to creating a new Array).
 *
 * @param {Object} col The collection-like object.
 * @param {Function} f The function to call for every value. This function
 *     takes 3 arguments (the value, the key or undefined if the collection has
 *     no notion of keys, and the collection) and should return something. The
 *     result will be used as the value in the new collection.
 * @param {Object=} opt_obj  The object to be used as the value of 'this'
 *     within {@code f}.
 * @return {!Object|!Array} A new collection with the new values.  If col is a
 *     key-less collection an array is returned.  If col has keys and values a
 *     plain old JS object is returned.
 */
goog.structs.map = function(col, f, opt_obj) {
  if (typeof col.map == 'function') {
    return col.map(f, opt_obj);
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.map(/** @type {!Array} */ (col), f, opt_obj);
  }

  var rv;
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  if (keys) {
    rv = {};
    for (var i = 0; i < l; i++) {
      rv[keys[i]] = f.call(opt_obj, values[i], keys[i], col);
    }
  } else {
    // We should not use goog.array.map here since we want to make sure that
    // the index is undefined as well as make sure that col is passed to the
    // function.
    rv = [];
    for (var i = 0; i < l; i++) {
      rv[i] = f.call(opt_obj, values[i], undefined, col);
    }
  }
  return rv;
};


/**
 * Calls f for each value in a collection. If any call returns true this returns
 * true (without checking the rest). If all returns false this returns false.
 *
 * @param {Object|Array|string} col The collection-like object.
 * @param {Function} f The function to call for every value. This function takes
 *     3 arguments (the value, the key or undefined if the collection has no
 *     notion of keys, and the collection) and should return a Boolean.
 * @param {Object=} opt_obj  The object to be used as the value of 'this'
 *     within {@code f}.
 * @return {boolean} True if any value passes the test.
 */
goog.structs.some = function(col, f, opt_obj) {
  if (typeof col.some == 'function') {
    return col.some(f, opt_obj);
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.some(/** @type {!Array} */ (col), f, opt_obj);
  }
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  for (var i = 0; i < l; i++) {
    if (f.call(opt_obj, values[i], keys && keys[i], col)) {
      return true;
    }
  }
  return false;
};


/**
 * Calls f for each value in a collection. If all calls return true this return
 * true this returns true. If any returns false this returns false at this point
 *  and does not continue to check the remaining values.
 *
 * @param {Object} col The collection-like object.
 * @param {Function} f The function to call for every value. This function takes
 *     3 arguments (the value, the key or undefined if the collection has no
 *     notion of keys, and the collection) and should return a Boolean.
 * @param {Object=} opt_obj  The object to be used as the value of 'this'
 *     within {@code f}.
 * @return {boolean} True if all key-value pairs pass the test.
 */
goog.structs.every = function(col, f, opt_obj) {
  if (typeof col.every == 'function') {
    return col.every(f, opt_obj);
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.every(/** @type {!Array} */ (col), f, opt_obj);
  }
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  for (var i = 0; i < l; i++) {
    if (!f.call(opt_obj, values[i], keys && keys[i], col)) {
      return false;
    }
  }
  return true;
};
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Datastructure: Hash Map.
 *
 * @author arv@google.com (Erik Arvidsson)
 * @author jonp@google.com (Jon Perlow) Optimized for IE6
 *
 * This file contains an implementation of a Map structure. It implements a lot
 * of the methods used in goog.structs so those functions work on hashes.  For
 * convenience with common usage the methods accept any type for the key, though
 * internally they will be cast to strings.
 */


goog.provide('goog.structs.Map');

goog.require('goog.iter.Iterator');
goog.require('goog.iter.StopIteration');
goog.require('goog.object');
goog.require('goog.structs');



/**
 * Class for Hash Map datastructure.
 * @param {*=} opt_map Map or Object to initialize the map with.
 * @param {...*} var_args If 2 or more arguments are present then they
 *     will be used as key-value pairs.
 * @constructor
 */
goog.structs.Map = function(opt_map, var_args) {

  /**
   * Underlying JS object used to implement the map.
   * @type {!Object}
   * @private
   */
  this.map_ = {};

  /**
   * An array of keys. This is necessary for two reasons:
   *   1. Iterating the keys using for (var key in this.map_) allocates an
   *      object for every key in IE which is really bad for IE6 GC perf.
   *   2. Without a side data structure, we would need to escape all the keys
   *      as that would be the only way we could tell during iteration if the
   *      key was an internal key or a property of the object.
   *
   * This array can contain deleted keys so it's necessary to check the map
   * as well to see if the key is still in the map (this doesn't require a
   * memory allocation in IE).
   * @type {!Array.<string>}
   * @private
   */
  this.keys_ = [];

  var argLength = arguments.length;

  if (argLength > 1) {
    if (argLength % 2) {
      throw Error('Uneven number of arguments');
    }
    for (var i = 0; i < argLength; i += 2) {
      this.set(arguments[i], arguments[i + 1]);
    }
  } else if (opt_map) {
    this.addAll(/** @type {Object} */ (opt_map));
  }
};


/**
 * The number of key value pairs in the map.
 * @private
 * @type {number}
 */
goog.structs.Map.prototype.count_ = 0;


/**
 * Version used to detect changes while iterating.
 * @private
 * @type {number}
 */
goog.structs.Map.prototype.version_ = 0;


/**
 * @return {number} The number of key-value pairs in the map.
 */
goog.structs.Map.prototype.getCount = function() {
  return this.count_;
};


/**
 * Returns the values of the map.
 * @return {!Array} The values in the map.
 */
goog.structs.Map.prototype.getValues = function() {
  this.cleanupKeysArray_();

  var rv = [];
  for (var i = 0; i < this.keys_.length; i++) {
    var key = this.keys_[i];
    rv.push(this.map_[key]);
  }
  return rv;
};


/**
 * Returns the keys of the map.
 * @return {!Array.<string>} Array of string values.
 */
goog.structs.Map.prototype.getKeys = function() {
  this.cleanupKeysArray_();
  return /** @type {!Array.<string>} */ (this.keys_.concat());
};


/**
 * Whether the map contains the given key.
 * @param {*} key The key to check for.
 * @return {boolean} Whether the map contains the key.
 */
goog.structs.Map.prototype.containsKey = function(key) {
  return goog.structs.Map.hasKey_(this.map_, key);
};


/**
 * Whether the map contains the given value. This is O(n).
 * @param {*} val The value to check for.
 * @return {boolean} Whether the map contains the value.
 */
goog.structs.Map.prototype.containsValue = function(val) {
  for (var i = 0; i < this.keys_.length; i++) {
    var key = this.keys_[i];
    if (goog.structs.Map.hasKey_(this.map_, key) && this.map_[key] == val) {
      return true;
    }
  }
  return false;
};


/**
 * Whether this map is equal to the argument map.
 * @param {goog.structs.Map} otherMap The map against which to test equality.
 * @param {function(*, *) : boolean=} opt_equalityFn Optional equality function
 *     to test equality of values. If not specified, this will test whether
 *     the values contained in each map are identical objects.
 * @return {boolean} Whether the maps are equal.
 */
goog.structs.Map.prototype.equals = function(otherMap, opt_equalityFn) {
  if (this === otherMap) {
    return true;
  }

  if (this.count_ != otherMap.getCount()) {
    return false;
  }

  var equalityFn = opt_equalityFn || goog.structs.Map.defaultEquals;

  this.cleanupKeysArray_();
  for (var key, i = 0; key = this.keys_[i]; i++) {
    if (!equalityFn(this.get(key), otherMap.get(key))) {
      return false;
    }
  }

  return true;
};


/**
 * Default equality test for values.
 * @param {*} a The first value.
 * @param {*} b The second value.
 * @return {boolean} Whether a and b reference the same object.
 */
goog.structs.Map.defaultEquals = function(a, b) {
  return a === b;
};


/**
 * @return {boolean} Whether the map is empty.
 */
goog.structs.Map.prototype.isEmpty = function() {
  return this.count_ == 0;
};


/**
 * Removes all key-value pairs from the map.
 */
goog.structs.Map.prototype.clear = function() {
  this.map_ = {};
  this.keys_.length = 0;
  this.count_ = 0;
  this.version_ = 0;
};


/**
 * Removes a key-value pair based on the key. This is O(logN) amortized due to
 * updating the keys array whenever the count becomes half the size of the keys
 * in the keys array.
 * @param {*} key  The key to remove.
 * @return {boolean} Whether object was removed.
 */
goog.structs.Map.prototype.remove = function(key) {
  if (goog.structs.Map.hasKey_(this.map_, key)) {
    delete this.map_[key];
    this.count_--;
    this.version_++;

    // clean up the keys array if the threshhold is hit
    if (this.keys_.length > 2 * this.count_) {
      this.cleanupKeysArray_();
    }

    return true;
  }
  return false;
};


/**
 * Cleans up the temp keys array by removing entries that are no longer in the
 * map.
 * @private
 */
goog.structs.Map.prototype.cleanupKeysArray_ = function() {
  if (this.count_ != this.keys_.length) {
    // First remove keys that are no longer in the map.
    var srcIndex = 0;
    var destIndex = 0;
    while (srcIndex < this.keys_.length) {
      var key = this.keys_[srcIndex];
      if (goog.structs.Map.hasKey_(this.map_, key)) {
        this.keys_[destIndex++] = key;
      }
      srcIndex++;
    }
    this.keys_.length = destIndex;
  }

  if (this.count_ != this.keys_.length) {
    // If the count still isn't correct, that means we have duplicates. This can
    // happen when the same key is added and removed multiple times. Now we have
    // to allocate one extra Object to remove the duplicates. This could have
    // been done in the first pass, but in the common case, we can avoid
    // allocating an extra object by only doing this when necessary.
    var seen = {};
    var srcIndex = 0;
    var destIndex = 0;
    while (srcIndex < this.keys_.length) {
      var key = this.keys_[srcIndex];
      if (!(goog.structs.Map.hasKey_(seen, key))) {
        this.keys_[destIndex++] = key;
        seen[key] = 1;
      }
      srcIndex++;
    }
    this.keys_.length = destIndex;
  }
};


/**
 * Returns the value for the given key.  If the key is not found and the default
 * value is not given this will return {@code undefined}.
 * @param {*} key The key to get the value for.
 * @param {*=} opt_val The value to return if no item is found for the given
 *     key, defaults to undefined.
 * @return {*} The value for the given key.
 */
goog.structs.Map.prototype.get = function(key, opt_val) {
  if (goog.structs.Map.hasKey_(this.map_, key)) {
    return this.map_[key];
  }
  return opt_val;
};


/**
 * Adds a key-value pair to the map.
 * @param {*} key The key.
 * @param {*} value The value to add.
 */
goog.structs.Map.prototype.set = function(key, value) {
  if (!(goog.structs.Map.hasKey_(this.map_, key))) {
    this.count_++;
    this.keys_.push(key);
    // Only change the version if we add a new key.
    this.version_++;
  }
  this.map_[key] = value;
};


/**
 * Adds multiple key-value pairs from another goog.structs.Map or Object.
 * @param {Object} map  Object containing the data to add.
 */
goog.structs.Map.prototype.addAll = function(map) {
  var keys, values;
  if (map instanceof goog.structs.Map) {
    keys = map.getKeys();
    values = map.getValues();
  } else {
    keys = goog.object.getKeys(map);
    values = goog.object.getValues(map);
  }
  // we could use goog.array.forEach here but I don't want to introduce that
  // dependency just for this.
  for (var i = 0; i < keys.length; i++) {
    this.set(keys[i], values[i]);
  }
};


/**
 * Clones a map and returns a new map.
 * @return {!goog.structs.Map} A new map with the same key-value pairs.
 */
goog.structs.Map.prototype.clone = function() {
  return new goog.structs.Map(this);
};


/**
 * Returns a new map in which all the keys and values are interchanged
 * (keys become values and values become keys). If multiple keys map to the
 * same value, the chosen transposed value is implementation-dependent.
 *
 * It acts very similarly to {goog.object.transpose(Object)}.
 *
 * @return {!goog.structs.Map} The transposed map.
 */
goog.structs.Map.prototype.transpose = function() {
  var transposed = new goog.structs.Map();
  for (var i = 0; i < this.keys_.length; i++) {
    var key = this.keys_[i];
    var value = this.map_[key];
    transposed.set(value, key);
  }

  return transposed;
};


/**
 * @return {!Object} Object representation of the map.
 */
goog.structs.Map.prototype.toObject = function() {
  this.cleanupKeysArray_();
  var obj = {};
  for (var i = 0; i < this.keys_.length; i++) {
    var key = this.keys_[i];
    obj[key] = this.map_[key];
  }
  return obj;
};


/**
 * Returns an iterator that iterates over the keys in the map.  Removal of keys
 * while iterating might have undesired side effects.
 * @return {!goog.iter.Iterator} An iterator over the keys in the map.
 */
goog.structs.Map.prototype.getKeyIterator = function() {
  return this.__iterator__(true);
};


/**
 * Returns an iterator that iterates over the values in the map.  Removal of
 * keys while iterating might have undesired side effects.
 * @return {!goog.iter.Iterator} An iterator over the values in the map.
 */
goog.structs.Map.prototype.getValueIterator = function() {
  return this.__iterator__(false);
};


/**
 * Returns an iterator that iterates over the values or the keys in the map.
 * This throws an exception if the map was mutated since the iterator was
 * created.
 * @param {boolean=} opt_keys True to iterate over the keys. False to iterate
 *     over the values.  The default value is false.
 * @return {!goog.iter.Iterator} An iterator over the values or keys in the map.
 */
goog.structs.Map.prototype.__iterator__ = function(opt_keys) {
  // Clean up keys to minimize the risk of iterating over dead keys.
  this.cleanupKeysArray_();

  var i = 0;
  var keys = this.keys_;
  var map = this.map_;
  var version = this.version_;
  var selfObj = this;

  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    while (true) {
      if (version != selfObj.version_) {
        throw Error('The map has changed since the iterator was created');
      }
      if (i >= keys.length) {
        throw goog.iter.StopIteration;
      }
      var key = keys[i++];
      return opt_keys ? key : map[key];
    }
  };
  return newIter;
};


/**
 * Safe way to test for hasOwnProperty.  It even allows testing for
 * 'hasOwnProperty'.
 * @param {Object} obj The object to test for presence of the given key.
 * @param {*} key The key to check for.
 * @return {boolean} Whether the object has the key.
 * @private
 */
goog.structs.Map.hasKey_ = function(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
};
// Copyright 2007 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Error codes shared between goog.net.IframeIo and
 * goog.net.XhrIo.
 */

goog.provide('goog.net.ErrorCode');


/**
 * Error codes
 * @enum {number}
 */
goog.net.ErrorCode = {

  /**
   * There is no error condition.
   */
  NO_ERROR: 0,

  /**
   * The most common error from iframeio, unfortunately, is that the browser
   * responded with an error page that is classed as a different domain. The
   * situations, are when a browser error page  is shown -- 404, access denied,
   * DNS failure, connection reset etc.)
   *
   */
  ACCESS_DENIED: 1,

  /**
   * Currently the only case where file not found will be caused is when the
   * code is running on the local file system and a non-IE browser makes a
   * request to a file that doesn't exist.
   */
  FILE_NOT_FOUND: 2,

  /**
   * If Firefox shows a browser error page, such as a connection reset by
   * server or access denied, then it will fail silently without the error or
   * load handlers firing.
   */
  FF_SILENT_ERROR: 3,

  /**
   * Custom error provided by the client through the error check hook.
   */
  CUSTOM_ERROR: 4,

  /**
   * Exception was thrown while processing the request.
   */
  EXCEPTION: 5,

  /**
   * The Http response returned a non-successful http status code.
   */
  HTTP_ERROR: 6,

  /**
   * The request was aborted.
   */
  ABORT: 7,

  /**
   * The request timed out.
   */
  TIMEOUT: 8,

  /**
   * The resource is not available offline.
   */
  OFFLINE: 9
};


/**
 * Returns a friendly error message for an error code. These messages are for
 * debugging and are not localized.
 * @param {goog.net.ErrorCode} errorCode An error code.
 * @return {string} A message for debugging.
 */
goog.net.ErrorCode.getDebugMessage = function(errorCode) {
  switch (errorCode) {
    case goog.net.ErrorCode.NO_ERROR:
      return 'No Error';

    case goog.net.ErrorCode.ACCESS_DENIED:
      return 'Access denied to content document';

    case goog.net.ErrorCode.FILE_NOT_FOUND:
      return 'File not found';

    case goog.net.ErrorCode.FF_SILENT_ERROR:
      return 'Firefox silently errored';

    case goog.net.ErrorCode.CUSTOM_ERROR:
      return 'Application custom error';

    case goog.net.ErrorCode.EXCEPTION:
      return 'An exception occurred';

    case goog.net.ErrorCode.HTTP_ERROR:
      return 'Http response at 400 or 500 level';

    case goog.net.ErrorCode.ABORT:
      return 'Request was aborted';

    case goog.net.ErrorCode.TIMEOUT:
      return 'Request timed out';

    case goog.net.ErrorCode.OFFLINE:
      return 'The resource is not available offline';

    default:
      return 'Unrecognized error code';
  }
};
// Copyright 2011 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Constants for HTTP status codes.
 */

goog.provide('goog.net.HttpStatus');


/**
 * HTTP Status Codes defined in RFC 2616.
 * @see http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html
 * @enum {number}
 */
goog.net.HttpStatus = {
  // Informational 1xx
  CONTINUE: 100,
  SWITCHING_PROTOCOLS: 101,

  // Successful 2xx
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NON_AUTHORITATIVE_INFORMATION: 203,
  NO_CONTENT: 204,
  RESET_CONTENT: 205,
  PARTIAL_CONTENT: 206,

  // Redirection 3xx
  MULTIPLE_CHOICES: 300,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  SEE_OTHER: 303,
  NOT_MODIFIED: 304,
  USE_PROXY: 305,
  TEMPORARY_REDIRECT: 307,

  // Client Error 4xx
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  PROXY_AUTHENTICATION_REQUIRED: 407,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  REQUEST_ENTITY_TOO_LARGE: 413,
  REQUEST_URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA_TYPE: 415,
  REQUEST_RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,

  // Server Error 5xx
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,

  /*
   * IE returns this code for 204 due to its use of URLMon, which returns this
   * code for 'Operation Aborted'. The status text is 'Unknown', the response
   * headers are ''. Known to occur on IE 6 on XP through IE9 on Win7.
   */
  QUIRK_IE_NO_CONTENT: 1223
};


/**
 * Returns whether the given status should be considered successful.
 *
 * Successful codes are OK (200), CREATED (201), ACCEPTED (202),
 * NO CONTENT (204), NOT MODIFIED (304), and IE's no content code (1223).
 *
 * @param {number} status The status code to test.
 * @return {boolean} Whether the status code should be considered successful.
 */
goog.net.HttpStatus.isSuccess = function(status) {
  switch (status) {
    case goog.net.HttpStatus.OK:
    case goog.net.HttpStatus.CREATED:
    case goog.net.HttpStatus.ACCEPTED:
    case goog.net.HttpStatus.NO_CONTENT:
    case goog.net.HttpStatus.NOT_MODIFIED:
    case goog.net.HttpStatus.QUIRK_IE_NO_CONTENT:
      return true;

    default:
      return false;
  }
};
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview JSON utility functions.
 * @author arv@google.com (Erik Arvidsson)
 */


goog.provide('goog.json');
goog.provide('goog.json.Serializer');


/**
 * Tests if a string is an invalid JSON string. This only ensures that we are
 * not using any invalid characters
 * @param {string} s The string to test.
 * @return {boolean} True if the input is a valid JSON string.
 * @private
 */
goog.json.isValid_ = function(s) {
  // All empty whitespace is not valid.
  if (/^\s*$/.test(s)) {
    return false;
  }

  // This is taken from http://www.json.org/json2.js which is released to the
  // public domain.
  // Changes: We dissallow \u2028 Line separator and \u2029 Paragraph separator
  // inside strings.  We also treat \u2028 and \u2029 as whitespace which they
  // are in the RFC but IE and Safari does not match \s to these so we need to
  // include them in the reg exps in all places where whitespace is allowed.
  // We allowed \x7f inside strings because some tools don't escape it,
  // e.g. http://www.json.org/java/org/json/JSONObject.java

  // Parsing happens in three stages. In the first stage, we run the text
  // against regular expressions that look for non-JSON patterns. We are
  // especially concerned with '()' and 'new' because they can cause invocation,
  // and '=' because it can cause mutation. But just to be safe, we want to
  // reject all unexpected forms.

  // We split the first stage into 4 regexp operations in order to work around
  // crippling inefficiencies in IE's and Safari's regexp engines. First we
  // replace all backslash pairs with '@' (a non-JSON character). Second, we
  // replace all simple value tokens with ']' characters. Third, we delete all
  // open brackets that follow a colon or comma or that begin the text. Finally,
  // we look to see that the remaining characters are only whitespace or ']' or
  // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

  // Don't make these static since they have the global flag.
  var backslashesRe = /\\["\\\/bfnrtu]/g;
  var simpleValuesRe =
      /"[^"\\\n\r\u2028\u2029\x00-\x08\x10-\x1f\x80-\x9f]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
  var openBracketsRe = /(?:^|:|,)(?:[\s\u2028\u2029]*\[)+/g;
  var remainderRe = /^[\],:{}\s\u2028\u2029]*$/;

  return remainderRe.test(s.replace(backslashesRe, '@').
      replace(simpleValuesRe, ']').
      replace(openBracketsRe, ''));
};


/**
 * Parses a JSON string and returns the result. This throws an exception if
 * the string is an invalid JSON string.
 *
 * Note that this is very slow on large strings. If you trust the source of
 * the string then you should use unsafeParse instead.
 *
 * @param {*} s The JSON string to parse.
 * @return {Object} The object generated from the JSON string.
 */
goog.json.parse = function(s) {
  var o = String(s);
  if (goog.json.isValid_(o)) {
    /** @preserveTry */
    try {
      return /** @type {Object} */ (eval('(' + o + ')'));
    } catch (ex) {
    }
  }
  throw Error('Invalid JSON string: ' + o);
};


/**
 * Parses a JSON string and returns the result. This uses eval so it is open
 * to security issues and it should only be used if you trust the source.
 *
 * @param {string} s The JSON string to parse.
 * @return {Object} The object generated from the JSON string.
 */
goog.json.unsafeParse = function(s) {
  return /** @type {Object} */ (eval('(' + s + ')'));
};


/**
 * JSON replacer, as defined in Section 15.12.3 of the ES5 spec.
 *
 * TODO(nicksantos): Array should also be a valid replacer.
 *
 * @typedef {function(this:Object, string, *): *}
 */
goog.json.Replacer;


/**
 * Serializes an object or a value to a JSON string.
 *
 * @param {*} object The object to serialize.
 * @param {?goog.json.Replacer=} opt_replacer A replacer function
 *     called for each (key, value) pair that determines how the value
 *     should be serialized. By defult, this just returns the value
 *     and allows default serialization to kick in.
 * @throws Error if there are loops in the object graph.
 * @return {string} A JSON string representation of the input.
 */
goog.json.serialize = function(object, opt_replacer) {
  // TODO(nicksantos): Change this to default to JSON.stringify when available.
  // I need to fiddle with the default externs a bit to make this happen.
  return new goog.json.Serializer(opt_replacer).serialize(object);
};



/**
 * Class that is used to serialize JSON objects to a string.
 * @param {?goog.json.Replacer=} opt_replacer Replacer.
 * @constructor
 */
goog.json.Serializer = function(opt_replacer) {
  /**
   * @type {goog.json.Replacer|null|undefined}
   * @private
   */
  this.replacer_ = opt_replacer;
};


/**
 * Serializes an object or a value to a JSON string.
 *
 * @param {*} object The object to serialize.
 * @throws Error if there are loops in the object graph.
 * @return {string} A JSON string representation of the input.
 */
goog.json.Serializer.prototype.serialize = function(object) {
  var sb = [];
  this.serialize_(object, sb);
  return sb.join('');
};


/**
 * Serializes a generic value to a JSON string
 * @private
 * @param {*} object The object to serialize.
 * @param {Array} sb Array used as a string builder.
 * @throws Error if there are loops in the object graph.
 */
goog.json.Serializer.prototype.serialize_ = function(object, sb) {
  switch (typeof object) {
    case 'string':
      this.serializeString_((/** @type {string} */ object), sb);
      break;
    case 'number':
      this.serializeNumber_((/** @type {number} */ object), sb);
      break;
    case 'boolean':
      sb.push(object);
      break;
    case 'undefined':
      sb.push('null');
      break;
    case 'object':
      if (object == null) {
        sb.push('null');
        break;
      }
      if (goog.isArray(object)) {
        this.serializeArray_((/** @type {!Array} */ object), sb);
        break;
      }
      // should we allow new String, new Number and new Boolean to be treated
      // as string, number and boolean? Most implementations do not and the
      // need is not very big
      this.serializeObject_((/** @type {Object} */ object), sb);
      break;
    case 'function':
      // Skip functions.
      // TODO(user) Should we return something here?
      break;
    default:
      throw Error('Unknown type: ' + typeof object);
  }
};


/**
 * Character mappings used internally for goog.string.quote
 * @private
 * @type {Object}
 */
goog.json.Serializer.charToJsonCharCache_ = {
  '\"': '\\"',
  '\\': '\\\\',
  '/': '\\/',
  '\b': '\\b',
  '\f': '\\f',
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',

  '\x0B': '\\u000b' // '\v' is not supported in JScript
};


/**
 * Regular expression used to match characters that need to be replaced.
 * The S60 browser has a bug where unicode characters are not matched by
 * regular expressions. The condition below detects such behaviour and
 * adjusts the regular expression accordingly.
 * @private
 * @type {RegExp}
 */
goog.json.Serializer.charsToReplace_ = /\uffff/.test('\uffff') ?
    /[\\\"\x00-\x1f\x7f-\uffff]/g : /[\\\"\x00-\x1f\x7f-\xff]/g;


/**
 * Serializes a string to a JSON string
 * @private
 * @param {string} s The string to serialize.
 * @param {Array} sb Array used as a string builder.
 */
goog.json.Serializer.prototype.serializeString_ = function(s, sb) {
  // The official JSON implementation does not work with international
  // characters.
  sb.push('"', s.replace(goog.json.Serializer.charsToReplace_, function(c) {
    // caching the result improves performance by a factor 2-3
    if (c in goog.json.Serializer.charToJsonCharCache_) {
      return goog.json.Serializer.charToJsonCharCache_[c];
    }

    var cc = c.charCodeAt(0);
    var rv = '\\u';
    if (cc < 16) {
      rv += '000';
    } else if (cc < 256) {
      rv += '00';
    } else if (cc < 4096) { // \u1000
      rv += '0';
    }
    return goog.json.Serializer.charToJsonCharCache_[c] = rv + cc.toString(16);
  }), '"');
};


/**
 * Serializes a number to a JSON string
 * @private
 * @param {number} n The number to serialize.
 * @param {Array} sb Array used as a string builder.
 */
goog.json.Serializer.prototype.serializeNumber_ = function(n, sb) {
  sb.push(isFinite(n) && !isNaN(n) ? n : 'null');
};


/**
 * Serializes an array to a JSON string
 * @private
 * @param {Array} arr The array to serialize.
 * @param {Array} sb Array used as a string builder.
 */
goog.json.Serializer.prototype.serializeArray_ = function(arr, sb) {
  var l = arr.length;
  sb.push('[');
  var sep = '';
  for (var i = 0; i < l; i++) {
    sb.push(sep);

    var value = arr[i];
    this.serialize_(
        this.replacer_ ? this.replacer_.call(arr, String(i), value) : value,
        sb);

    sep = ',';
  }
  sb.push(']');
};


/**
 * Serializes an object to a JSON string
 * @private
 * @param {Object} obj The object to serialize.
 * @param {Array} sb Array used as a string builder.
 */
goog.json.Serializer.prototype.serializeObject_ = function(obj, sb) {
  sb.push('{');
  var sep = '';
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      var value = obj[key];
      // Skip functions.
      // TODO(ptucker) Should we return something for function properties?
      if (typeof value != 'function') {
        sb.push(sep);
        this.serializeString_(key, sb);
        sb.push(':');

        this.serialize_(
            this.replacer_ ? this.replacer_.call(obj, key, value) : value,
            sb);

        sep = ',';
      }
    }
  }
  sb.push('}');
};
// Copyright 2010 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Interface for a factory for creating XMLHttpRequest objects
 * and metadata about them.
 * @author dbk@google.com (David Barrett-Kahn)
 */

goog.provide('goog.net.XmlHttpFactory');



/**
 * Abstract base class for an XmlHttpRequest factory.
 * @constructor
 */
goog.net.XmlHttpFactory = function() {
};


/**
 * Cache of options - we only actually call internalGetOptions once.
 * @type {Object}
 * @private
 */
goog.net.XmlHttpFactory.prototype.cachedOptions_ = null;


/**
 * @return {!(XMLHttpRequest|GearsHttpRequest)} A new XMLHttpRequest instance.
 */
goog.net.XmlHttpFactory.prototype.createInstance = goog.abstractMethod;


/**
 * @return {Object} Options describing how xhr objects obtained from this
 *     factory should be used.
 */
goog.net.XmlHttpFactory.prototype.getOptions = function() {
  return this.cachedOptions_ ||
      (this.cachedOptions_ = this.internalGetOptions());
};


/**
 * Override this method in subclasses to preserve the caching offered by
 * getOptions().
 * @return {Object} Options describing how xhr objects obtained from this
 *     factory should be used.
 * @protected
 */
goog.net.XmlHttpFactory.prototype.internalGetOptions = goog.abstractMethod;
// Copyright 2010 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Implementation of XmlHttpFactory which allows construction from
 * simple factory methods.
 * @author dbk@google.com (David Barrett-Kahn)
 */

goog.provide('goog.net.WrapperXmlHttpFactory');

goog.require('goog.net.XmlHttpFactory');



/**
 * An xhr factory subclass which can be constructed using two factory methods.
 * This exists partly to allow the preservation of goog.net.XmlHttp.setFactory()
 * with an unchanged signature.
 * @param {function() : !(XMLHttpRequest|GearsHttpRequest)} xhrFactory A
 *     function which returns a new XHR object.
 * @param {function() : !Object} optionsFactory A function which returns the
 *     options associated with xhr objects from this factory.
 * @extends {goog.net.XmlHttpFactory}
 * @constructor
 */
goog.net.WrapperXmlHttpFactory = function(xhrFactory, optionsFactory) {
  goog.net.XmlHttpFactory.call(this);

  /**
   * XHR factory method.
   * @type {function() : !(XMLHttpRequest|GearsHttpRequest)}
   * @private
   */
  this.xhrFactory_ = xhrFactory;

  /**
   * Options factory method.
   * @type {function() : !Object}
   * @private
   */
  this.optionsFactory_ = optionsFactory;
};
goog.inherits(goog.net.WrapperXmlHttpFactory, goog.net.XmlHttpFactory);


/** @override */
goog.net.WrapperXmlHttpFactory.prototype.createInstance = function() {
  return this.xhrFactory_();
};


/** @override */
goog.net.WrapperXmlHttpFactory.prototype.getOptions = function() {
  return this.optionsFactory_();
};

// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Low level handling of XMLHttpRequest.
 * @author arv@google.com (Erik Arvidsson)
 * @author dbk@google.com (David Barrett-Kahn)
 */

goog.provide('goog.net.DefaultXmlHttpFactory');
goog.provide('goog.net.XmlHttp');
goog.provide('goog.net.XmlHttp.OptionType');
goog.provide('goog.net.XmlHttp.ReadyState');

goog.require('goog.net.WrapperXmlHttpFactory');
goog.require('goog.net.XmlHttpFactory');


/**
 * Static class for creating XMLHttpRequest objects.
 * @return {!(XMLHttpRequest|GearsHttpRequest)} A new XMLHttpRequest object.
 */
goog.net.XmlHttp = function() {
  return goog.net.XmlHttp.factory_.createInstance();
};


/**
 * Gets the options to use with the XMLHttpRequest objects obtained using
 * the static methods.
 * @return {Object} The options.
 */
goog.net.XmlHttp.getOptions = function() {
  return goog.net.XmlHttp.factory_.getOptions();
};


/**
 * Type of options that an XmlHttp object can have.
 * @enum {number}
 */
goog.net.XmlHttp.OptionType = {
  /**
   * Whether a goog.nullFunction should be used to clear the onreadystatechange
   * handler instead of null.
   */
  USE_NULL_FUNCTION: 0,

  /**
   * NOTE(user): In IE if send() errors on a *local* request the readystate
   * is still changed to COMPLETE.  We need to ignore it and allow the
   * try/catch around send() to pick up the error.
   */
  LOCAL_REQUEST_ERROR: 1
};


/**
 * Status constants for XMLHTTP, matches:
 * http://msdn.microsoft.com/library/default.asp?url=/library/
 *   en-us/xmlsdk/html/0e6a34e4-f90c-489d-acff-cb44242fafc6.asp
 * @enum {number}
 */
goog.net.XmlHttp.ReadyState = {
  /**
   * Constant for when xmlhttprequest.readyState is uninitialized
   */
  UNINITIALIZED: 0,

  /**
   * Constant for when xmlhttprequest.readyState is loading.
   */
  LOADING: 1,

  /**
   * Constant for when xmlhttprequest.readyState is loaded.
   */
  LOADED: 2,

  /**
   * Constant for when xmlhttprequest.readyState is in an interactive state.
   */
  INTERACTIVE: 3,

  /**
   * Constant for when xmlhttprequest.readyState is completed
   */
  COMPLETE: 4
};


/**
 * The global factory instance for creating XMLHttpRequest objects.
 * @type {goog.net.XmlHttpFactory}
 * @private
 */
goog.net.XmlHttp.factory_;


/**
 * Sets the factories for creating XMLHttpRequest objects and their options.
 * @param {Function} factory The factory for XMLHttpRequest objects.
 * @param {Function} optionsFactory The factory for options.
 * @deprecated Use setGlobalFactory instead.
 */
goog.net.XmlHttp.setFactory = function(factory, optionsFactory) {
  goog.net.XmlHttp.setGlobalFactory(new goog.net.WrapperXmlHttpFactory(
      (/** @type {function() : !(XMLHttpRequest|GearsHttpRequest)} */ factory),
      (/** @type {function() : !Object}*/ optionsFactory)));
};


/**
 * Sets the global factory object.
 * @param {!goog.net.XmlHttpFactory} factory New global factory object.
 */
goog.net.XmlHttp.setGlobalFactory = function(factory) {
  goog.net.XmlHttp.factory_ = factory;
};



/**
 * Default factory to use when creating xhr objects.  You probably shouldn't be
 * instantiating this directly, but rather using it via goog.net.XmlHttp.
 * @extends {goog.net.XmlHttpFactory}
 * @constructor
 */
goog.net.DefaultXmlHttpFactory = function() {
  goog.net.XmlHttpFactory.call(this);
};
goog.inherits(goog.net.DefaultXmlHttpFactory, goog.net.XmlHttpFactory);


/** @override */
goog.net.DefaultXmlHttpFactory.prototype.createInstance = function() {
  var progId = this.getProgId_();
  if (progId) {
    return new ActiveXObject(progId);
  } else {
    return new XMLHttpRequest();
  }
};


/** @override */
goog.net.DefaultXmlHttpFactory.prototype.internalGetOptions = function() {
  var progId = this.getProgId_();
  var options = {};
  if (progId) {
    options[goog.net.XmlHttp.OptionType.USE_NULL_FUNCTION] = true;
    options[goog.net.XmlHttp.OptionType.LOCAL_REQUEST_ERROR] = true;
  }
  return options;
};


/**
 * The ActiveX PROG ID string to use to create xhr's in IE. Lazily initialized.
 * @type {?string}
 * @private
 */
goog.net.DefaultXmlHttpFactory.prototype.ieProgId_ = null;


/**
 * Initialize the private state used by other functions.
 * @return {string} The ActiveX PROG ID string to use to create xhr's in IE.
 * @private
 */
goog.net.DefaultXmlHttpFactory.prototype.getProgId_ = function() {
  // The following blog post describes what PROG IDs to use to create the
  // XMLHTTP object in Internet Explorer:
  // http://blogs.msdn.com/xmlteam/archive/2006/10/23/using-the-right-version-of-msxml-in-internet-explorer.aspx
  // However we do not (yet) fully trust that this will be OK for old versions
  // of IE on Win9x so we therefore keep the last 2.
  if (!this.ieProgId_ && typeof XMLHttpRequest == 'undefined' &&
      typeof ActiveXObject != 'undefined') {
    // Candidate Active X types.
    var ACTIVE_X_IDENTS = ['MSXML2.XMLHTTP.6.0', 'MSXML2.XMLHTTP.3.0',
                           'MSXML2.XMLHTTP', 'Microsoft.XMLHTTP'];
    for (var i = 0; i < ACTIVE_X_IDENTS.length; i++) {
      var candidate = ACTIVE_X_IDENTS[i];
      /** @preserveTry */
      try {
        new ActiveXObject(candidate);
        // NOTE(user): cannot assign progid and return candidate in one line
        // because JSCompiler complaings: BUG 658126
        this.ieProgId_ = candidate;
        return candidate;
      } catch (e) {
        // do nothing; try next choice
      }
    }

    // couldn't find any matches
    throw Error('Could not create ActiveXObject. ActiveX might be disabled,' +
                ' or MSXML might not be installed');
  }

  return /** @type {string} */ (this.ieProgId_);
};


//Set the global factory to an instance of the default factory.
goog.net.XmlHttp.setGlobalFactory(new goog.net.DefaultXmlHttpFactory());
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Common events for the network classes.
 */


goog.provide('goog.net.EventType');


/**
 * Event names for network events
 * @enum {string}
 */
goog.net.EventType = {
  COMPLETE: 'complete',
  SUCCESS: 'success',
  ERROR: 'error',
  ABORT: 'abort',
  READY: 'ready',
  READY_STATE_CHANGE: 'readystatechange',
  TIMEOUT: 'timeout',
  INCREMENTAL_DATA: 'incrementaldata',
  PROGRESS: 'progress'
};
// Copyright 2011 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Defines the collection interface.
 *
 * @author nnaze@google.com (Nathan Naze)
 */

goog.provide('goog.structs.Collection');



/**
 * An interface for a collection of values.
 * @interface
 */
goog.structs.Collection = function() {};


/**
 * @param {*} value Value to add to the collection.
 */
goog.structs.Collection.prototype.add;


/**
 * @param {*} value Value to remove from the collection.
 */
goog.structs.Collection.prototype.remove;


/**
 * @param {*} value Value to find in the tree.
 * @return {boolean} Whether the collection contains the specified value.
 */
goog.structs.Collection.prototype.contains;


/**
 * @return {number} The number of values stored in the collection.
 */
goog.structs.Collection.prototype.getCount;

// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Datastructure: Set.
 *
 * @author arv@google.com (Erik Arvidsson)
 * @author pallosp@google.com (Peter Pallos)
 *
 * This class implements a set data structure. Adding and removing is O(1). It
 * supports both object and primitive values. Be careful because you can add
 * both 1 and new Number(1), because these are not the same. You can even add
 * multiple new Number(1) because these are not equal.
 */


goog.provide('goog.structs.Set');

goog.require('goog.structs');
goog.require('goog.structs.Collection');
goog.require('goog.structs.Map');



/**
 * A set that can contain both primitives and objects.  Adding and removing
 * elements is O(1).  Primitives are treated as identical if they have the same
 * type and convert to the same string.  Objects are treated as identical only
 * if they are references to the same object.  WARNING: A goog.structs.Set can
 * contain both 1 and (new Number(1)), because they are not the same.  WARNING:
 * Adding (new Number(1)) twice will yield two distinct elements, because they
 * are two different objects.  WARNING: Any object that is added to a
 * goog.structs.Set will be modified!  Because goog.getUid() is used to
 * identify objects, every object in the set will be mutated.
 * @param {Array|Object=} opt_values Initial values to start with.
 * @constructor
 * @implements {goog.structs.Collection}
 */
goog.structs.Set = function(opt_values) {
  this.map_ = new goog.structs.Map;
  if (opt_values) {
    this.addAll(opt_values);
  }
};


/**
 * Obtains a unique key for an element of the set.  Primitives will yield the
 * same key if they have the same type and convert to the same string.  Object
 * references will yield the same key only if they refer to the same object.
 * @param {*} val Object or primitive value to get a key for.
 * @return {string} A unique key for this value/object.
 * @private
 */
goog.structs.Set.getKey_ = function(val) {
  var type = typeof val;
  if (type == 'object' && val || type == 'function') {
    return 'o' + goog.getUid(/** @type {Object} */ (val));
  } else {
    return type.substr(0, 1) + val;
  }
};


/**
 * @return {number} The number of elements in the set.
 */
goog.structs.Set.prototype.getCount = function() {
  return this.map_.getCount();
};


/**
 * Add a primitive or an object to the set.
 * @param {*} element The primitive or object to add.
 */
goog.structs.Set.prototype.add = function(element) {
  this.map_.set(goog.structs.Set.getKey_(element), element);
};


/**
 * Adds all the values in the given collection to this set.
 * @param {Array|Object} col A collection containing the elements to add.
 */
goog.structs.Set.prototype.addAll = function(col) {
  var values = goog.structs.getValues(col);
  var l = values.length;
  for (var i = 0; i < l; i++) {
    this.add(values[i]);
  }
};


/**
 * Removes all values in the given collection from this set.
 * @param {Array|Object} col A collection containing the elements to remove.
 */
goog.structs.Set.prototype.removeAll = function(col) {
  var values = goog.structs.getValues(col);
  var l = values.length;
  for (var i = 0; i < l; i++) {
    this.remove(values[i]);
  }
};


/**
 * Removes the given element from this set.
 * @param {*} element The primitive or object to remove.
 * @return {boolean} Whether the element was found and removed.
 */
goog.structs.Set.prototype.remove = function(element) {
  return this.map_.remove(goog.structs.Set.getKey_(element));
};


/**
 * Removes all elements from this set.
 */
goog.structs.Set.prototype.clear = function() {
  this.map_.clear();
};


/**
 * Tests whether this set is empty.
 * @return {boolean} True if there are no elements in this set.
 */
goog.structs.Set.prototype.isEmpty = function() {
  return this.map_.isEmpty();
};


/**
 * Tests whether this set contains the given element.
 * @param {*} element The primitive or object to test for.
 * @return {boolean} True if this set contains the given element.
 */
goog.structs.Set.prototype.contains = function(element) {
  return this.map_.containsKey(goog.structs.Set.getKey_(element));
};


/**
 * Tests whether this set contains all the values in a given collection.
 * Repeated elements in the collection are ignored, e.g.  (new
 * goog.structs.Set([1, 2])).containsAll([1, 1]) is True.
 * @param {Object} col A collection-like object.
 * @return {boolean} True if the set contains all elements.
 */
goog.structs.Set.prototype.containsAll = function(col) {
  return goog.structs.every(col, this.contains, this);
};


/**
 * Finds all values that are present in both this set and the given collection.
 * @param {Array|Object} col A collection.
 * @return {!goog.structs.Set} A new set containing all the values (primitives
 *     or objects) present in both this set and the given collection.
 */
goog.structs.Set.prototype.intersection = function(col) {
  var result = new goog.structs.Set();

  var values = goog.structs.getValues(col);
  for (var i = 0; i < values.length; i++) {
    var value = values[i];
    if (this.contains(value)) {
      result.add(value);
    }
  }

  return result;
};


/**
 * Finds all values that are present in this set and not in the given
 * collection.
 * @param {Array|Object} col A collection.
 * @return {!goog.structs.Set} A new set containing all the values
 *     (primitives or objects) present in this set but not in the given
 *     collection.
 */
goog.structs.Set.prototype.difference = function(col) {
  var result = this.clone();
  result.removeAll(col);
  return result;
};


/**
 * Returns an array containing all the elements in this set.
 * @return {!Array} An array containing all the elements in this set.
 */
goog.structs.Set.prototype.getValues = function() {
  return this.map_.getValues();
};


/**
 * Creates a shallow clone of this set.
 * @return {!goog.structs.Set} A new set containing all the same elements as
 *     this set.
 */
goog.structs.Set.prototype.clone = function() {
  return new goog.structs.Set(this);
};


/**
 * Tests whether the given collection consists of the same elements as this set,
 * regardless of order, without repetition.  Primitives are treated as equal if
 * they have the same type and convert to the same string; objects are treated
 * as equal if they are references to the same object.  This operation is O(n).
 * @param {Object} col A collection.
 * @return {boolean} True if the given collection consists of the same elements
 *     as this set, regardless of order, without repetition.
 */
goog.structs.Set.prototype.equals = function(col) {
  return this.getCount() == goog.structs.getCount(col) && this.isSubsetOf(col);
};


/**
 * Tests whether the given collection contains all the elements in this set.
 * Primitives are treated as equal if they have the same type and convert to the
 * same string; objects are treated as equal if they are references to the same
 * object.  This operation is O(n).
 * @param {Object} col A collection.
 * @return {boolean} True if this set is a subset of the given collection.
 */
goog.structs.Set.prototype.isSubsetOf = function(col) {
  var colCount = goog.structs.getCount(col);
  if (this.getCount() > colCount) {
    return false;
  }
  // TODO(user) Find the minimal collection size where the conversion makes
  // the contains() method faster.
  if (!(col instanceof goog.structs.Set) && colCount > 5) {
    // Convert to a goog.structs.Set so that goog.structs.contains runs in
    // O(1) time instead of O(n) time.
    col = new goog.structs.Set(col);
  }
  return goog.structs.every(this, function(value) {
    return goog.structs.contains(col, value);
  });
};


/**
 * Returns an iterator that iterates over the elements in this set.
 * @param {boolean=} opt_keys This argument is ignored.
 * @return {!goog.iter.Iterator} An iterator over the elements in this set.
 */
goog.structs.Set.prototype.__iterator__ = function(opt_keys) {
  return this.map_.__iterator__(false);
};
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Logging and debugging utilities.
 *
 * @see ../demos/debug.html
 */

goog.provide('goog.debug');

goog.require('goog.array');
goog.require('goog.string');
goog.require('goog.structs.Set');
goog.require('goog.userAgent');


/**
 * Catches onerror events fired by windows and similar objects.
 * @param {function(Object)} logFunc The function to call with the error
 *    information.
 * @param {boolean=} opt_cancel Whether to stop the error from reaching the
 *    browser.
 * @param {Object=} opt_target Object that fires onerror events.
 */
goog.debug.catchErrors = function(logFunc, opt_cancel, opt_target) {
  var target = opt_target || goog.global;
  var oldErrorHandler = target.onerror;
  var retVal = !!opt_cancel;

  // Chrome interprets onerror return value backwards (http://crbug.com/92062)
  // until it was fixed in webkit revision r94061 (Webkit 535.3). This
  // workaround still needs to be skipped in Safari after the webkit change
  // gets pushed out in Safari.
  // See https://bugs.webkit.org/show_bug.cgi?id=67119
  if (goog.userAgent.WEBKIT && !goog.userAgent.isVersion('535.3')) {
    retVal = !retVal;
  }
  target.onerror = function(message, url, line) {
    if (oldErrorHandler) {
      oldErrorHandler(message, url, line);
    }
    logFunc({
      message: message,
      fileName: url,
      line: line
    });
    return retVal;
  };
};


/**
 * Creates a string representing an object and all its properties.
 * @param {Object|null|undefined} obj Object to expose.
 * @param {boolean=} opt_showFn Show the functions as well as the properties,
 *     default is false.
 * @return {string} The string representation of {@code obj}.
 */
goog.debug.expose = function(obj, opt_showFn) {
  if (typeof obj == 'undefined') {
    return 'undefined';
  }
  if (obj == null) {
    return 'NULL';
  }
  var str = [];

  for (var x in obj) {
    if (!opt_showFn && goog.isFunction(obj[x])) {
      continue;
    }
    var s = x + ' = ';
    /** @preserveTry */
    try {
      s += obj[x];
    } catch (e) {
      s += '*** ' + e + ' ***';
    }
    str.push(s);
  }
  return str.join('\n');
};


/**
 * Creates a string representing a given primitive or object, and for an
 * object, all its properties and nested objects.  WARNING: If an object is
 * given, it and all its nested objects will be modified.  To detect reference
 * cycles, this method identifies objects using goog.getUid() which mutates the
 * object.
 * @param {*} obj Object to expose.
 * @param {boolean=} opt_showFn Also show properties that are functions (by
 *     default, functions are omitted).
 * @return {string} A string representation of {@code obj}.
 */
goog.debug.deepExpose = function(obj, opt_showFn) {
  var previous = new goog.structs.Set();
  var str = [];

  var helper = function(obj, space) {
    var nestspace = space + '  ';

    var indentMultiline = function(str) {
      return str.replace(/\n/g, '\n' + space);
    };

    /** @preserveTry */
    try {
      if (!goog.isDef(obj)) {
        str.push('undefined');
      } else if (goog.isNull(obj)) {
        str.push('NULL');
      } else if (goog.isString(obj)) {
        str.push('"' + indentMultiline(obj) + '"');
      } else if (goog.isFunction(obj)) {
        str.push(indentMultiline(String(obj)));
      } else if (goog.isObject(obj)) {
        if (previous.contains(obj)) {
          // TODO(user): This is a bug; it falsely detects non-loops as loops
          // when the reference tree contains two references to the same object.
          str.push('*** reference loop detected ***');
        } else {
          previous.add(obj);
          str.push('{');
          for (var x in obj) {
            if (!opt_showFn && goog.isFunction(obj[x])) {
              continue;
            }
            str.push('\n');
            str.push(nestspace);
            str.push(x + ' = ');
            helper(obj[x], nestspace);
          }
          str.push('\n' + space + '}');
        }
      } else {
        str.push(obj);
      }
    } catch (e) {
      str.push('*** ' + e + ' ***');
    }
  };

  helper(obj, '');
  return str.join('');
};


/**
 * Recursively outputs a nested array as a string.
 * @param {Array} arr The array.
 * @return {string} String representing nested array.
 */
goog.debug.exposeArray = function(arr) {
  var str = [];
  for (var i = 0; i < arr.length; i++) {
    if (goog.isArray(arr[i])) {
      str.push(goog.debug.exposeArray(arr[i]));
    } else {
      str.push(arr[i]);
    }
  }
  return '[ ' + str.join(', ') + ' ]';
};


/**
 * Exposes an exception that has been caught by a try...catch and outputs the
 * error with a stack trace.
 * @param {Object} err Error object or string.
 * @param {Function=} opt_fn Optional function to start stack trace from.
 * @return {string} Details of exception.
 */
goog.debug.exposeException = function(err, opt_fn) {
  /** @preserveTry */
  try {
    var e = goog.debug.normalizeErrorObject(err);

    // Create the error message
    var error = 'Message: ' + goog.string.htmlEscape(e.message) +
        '\nUrl: <a href="view-source:' + e.fileName + '" target="_new">' +
        e.fileName + '</a>\nLine: ' + e.lineNumber + '\n\nBrowser stack:\n' +
        goog.string.htmlEscape(e.stack + '-> ') +
        '[end]\n\nJS stack traversal:\n' + goog.string.htmlEscape(
            goog.debug.getStacktrace(opt_fn) + '-> ');
    return error;
  } catch (e2) {
    return 'Exception trying to expose exception! You win, we lose. ' + e2;
  }
};


/**
 * Normalizes the error/exception object between browsers.
 * @param {Object} err Raw error object.
 * @return {Object} Normalized error object.
 */
goog.debug.normalizeErrorObject = function(err) {
  var href = goog.getObjectByName('window.location.href');
  if (goog.isString(err)) {
    return {
      'message': err,
      'name': 'Unknown error',
      'lineNumber': 'Not available',
      'fileName': href,
      'stack': 'Not available'
    };
  }

  var lineNumber, fileName;
  var threwError = false;

  try {
    lineNumber = err.lineNumber || err.line || 'Not available';
  } catch (e) {
    // Firefox 2 sometimes throws an error when accessing 'lineNumber':
    // Message: Permission denied to get property UnnamedClass.lineNumber
    lineNumber = 'Not available';
    threwError = true;
  }

  try {
    fileName = err.fileName || err.filename || err.sourceURL || href;
  } catch (e) {
    // Firefox 2 may also throw an error when accessing 'filename'.
    fileName = 'Not available';
    threwError = true;
  }

  // The IE Error object contains only the name and the message.
  // The Safari Error object uses the line and sourceURL fields.
  if (threwError || !err.lineNumber || !err.fileName || !err.stack) {
    return {
      'message': err.message,
      'name': err.name,
      'lineNumber': lineNumber,
      'fileName': fileName,
      'stack': err.stack || 'Not available'
    };
  }

  // Standards error object
  return err;
};


/**
 * Converts an object to an Error if it's a String,
 * adds a stacktrace if there isn't one,
 * and optionally adds an extra message.
 * @param {Error|string} err  the original thrown object or string.
 * @param {string=} opt_message  optional additional message to add to the
 *     error.
 * @return {Error} If err is a string, it is used to create a new Error,
 *     which is enhanced and returned.  Otherwise err itself is enhanced
 *     and returned.
 */
goog.debug.enhanceError = function(err, opt_message) {
  var error = typeof err == 'string' ? Error(err) : err;
  if (!error.stack) {
    error.stack = goog.debug.getStacktrace(arguments.callee.caller);
  }
  if (opt_message) {
    // find the first unoccupied 'messageX' property
    var x = 0;
    while (error['message' + x]) {
      ++x;
    }
    error['message' + x] = String(opt_message);
  }
  return error;
};


/**
 * Gets the current stack trace. Simple and iterative - doesn't worry about
 * catching circular references or getting the args.
 * @param {number=} opt_depth Optional maximum depth to trace back to.
 * @return {string} A string with the function names of all functions in the
 *     stack, separated by \n.
 */
goog.debug.getStacktraceSimple = function(opt_depth) {
  var sb = [];
  var fn = arguments.callee.caller;
  var depth = 0;

  while (fn && (!opt_depth || depth < opt_depth)) {
    sb.push(goog.debug.getFunctionName(fn));
    sb.push('()\n');
    /** @preserveTry */
    try {
      fn = fn.caller;
    } catch (e) {
      sb.push('[exception trying to get caller]\n');
      break;
    }
    depth++;
    if (depth >= goog.debug.MAX_STACK_DEPTH) {
      sb.push('[...long stack...]');
      break;
    }
  }
  if (opt_depth && depth >= opt_depth) {
    sb.push('[...reached max depth limit...]');
  } else {
    sb.push('[end]');
  }

  return sb.join('');
};


/**
 * Max length of stack to try and output
 * @type {number}
 */
goog.debug.MAX_STACK_DEPTH = 50;


/**
 * Gets the current stack trace, either starting from the caller or starting
 * from a specified function that's currently on the call stack.
 * @param {Function=} opt_fn Optional function to start getting the trace from.
 *     If not provided, defaults to the function that called this.
 * @return {string} Stack trace.
 */
goog.debug.getStacktrace = function(opt_fn) {
  return goog.debug.getStacktraceHelper_(opt_fn || arguments.callee.caller, []);
};


/**
 * Private helper for getStacktrace().
 * @param {Function} fn Function to start getting the trace from.
 * @param {Array} visited List of functions visited so far.
 * @return {string} Stack trace starting from function fn.
 * @private
 */
goog.debug.getStacktraceHelper_ = function(fn, visited) {
  var sb = [];

  // Circular reference, certain functions like bind seem to cause a recursive
  // loop so we need to catch circular references
  if (goog.array.contains(visited, fn)) {
    sb.push('[...circular reference...]');

  // Traverse the call stack until function not found or max depth is reached
  } else if (fn && visited.length < goog.debug.MAX_STACK_DEPTH) {
    sb.push(goog.debug.getFunctionName(fn) + '(');
    var args = fn.arguments;
    for (var i = 0; i < args.length; i++) {
      if (i > 0) {
        sb.push(', ');
      }
      var argDesc;
      var arg = args[i];
      switch (typeof arg) {
        case 'object':
          argDesc = arg ? 'object' : 'null';
          break;

        case 'string':
          argDesc = arg;
          break;

        case 'number':
          argDesc = String(arg);
          break;

        case 'boolean':
          argDesc = arg ? 'true' : 'false';
          break;

        case 'function':
          argDesc = goog.debug.getFunctionName(arg);
          argDesc = argDesc ? argDesc : '[fn]';
          break;

        case 'undefined':
        default:
          argDesc = typeof arg;
          break;
      }

      if (argDesc.length > 40) {
        argDesc = argDesc.substr(0, 40) + '...';
      }
      sb.push(argDesc);
    }
    visited.push(fn);
    sb.push(')\n');
    /** @preserveTry */
    try {
      sb.push(goog.debug.getStacktraceHelper_(fn.caller, visited));
    } catch (e) {
      sb.push('[exception trying to get caller]\n');
    }

  } else if (fn) {
    sb.push('[...long stack...]');
  } else {
    sb.push('[end]');
  }
  return sb.join('');
};


/**
 * Set a custom function name resolver.
 * @param {function(Function): string} resolver Resolves functions to their
 *     names.
 */
goog.debug.setFunctionResolver = function(resolver) {
  goog.debug.fnNameResolver_ = resolver;
};


/**
 * Gets a function name
 * @param {Function} fn Function to get name of.
 * @return {string} Function's name.
 */
goog.debug.getFunctionName = function(fn) {
  if (goog.debug.fnNameCache_[fn]) {
    return goog.debug.fnNameCache_[fn];
  }
  if (goog.debug.fnNameResolver_) {
    var name = goog.debug.fnNameResolver_(fn);
    if (name) {
      goog.debug.fnNameCache_[fn] = name;
      return name;
    }
  }

  // Heuristically determine function name based on code.
  var functionSource = String(fn);
  if (!goog.debug.fnNameCache_[functionSource]) {
    var matches = /function ([^\(]+)/.exec(functionSource);
    if (matches) {
      var method = matches[1];
      goog.debug.fnNameCache_[functionSource] = method;
    } else {
      goog.debug.fnNameCache_[functionSource] = '[Anonymous]';
    }
  }

  return goog.debug.fnNameCache_[functionSource];
};


/**
 * Makes whitespace visible by replacing it with printable characters.
 * This is useful in finding diffrences between the expected and the actual
 * output strings of a testcase.
 * @param {string} string whose whitespace needs to be made visible.
 * @return {string} string whose whitespace is made visible.
 */
goog.debug.makeWhitespaceVisible = function(string) {
  return string.replace(/ /g, '[_]')
      .replace(/\f/g, '[f]')
      .replace(/\n/g, '[n]\n')
      .replace(/\r/g, '[r]')
      .replace(/\t/g, '[t]');
};


/**
 * Hash map for storing function names that have already been looked up.
 * @type {Object}
 * @private
 */
goog.debug.fnNameCache_ = {};


/**
 * Resolves functions to their names.  Resolved function names will be cached.
 * @type {function(Function):string}
 * @private
 */
goog.debug.fnNameResolver_;
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Definition of the LogRecord class. Please minimize
 * dependencies this file has on other closure classes as any dependency it
 * takes won't be able to use the logging infrastructure.
 *
 */

goog.provide('goog.debug.LogRecord');



/**
 * LogRecord objects are used to pass logging requests between
 * the logging framework and individual log Handlers.
 * @constructor
 * @param {goog.debug.Logger.Level} level One of the level identifiers.
 * @param {string} msg The string message.
 * @param {string} loggerName The name of the source logger.
 * @param {number=} opt_time Time this log record was created if other than now.
 *     If 0, we use #goog.now.
 * @param {number=} opt_sequenceNumber Sequence number of this log record. This
 *     should only be passed in when restoring a log record from persistence.
 */
goog.debug.LogRecord = function(level, msg, loggerName,
    opt_time, opt_sequenceNumber) {
  this.reset(level, msg, loggerName, opt_time, opt_sequenceNumber);
};


/**
 * Time the LogRecord was created.
 * @type {number}
 * @private
 */
goog.debug.LogRecord.prototype.time_;


/**
 * Level of the LogRecord
 * @type {goog.debug.Logger.Level}
 * @private
 */
goog.debug.LogRecord.prototype.level_;


/**
 * Message associated with the record
 * @type {string}
 * @private
 */
goog.debug.LogRecord.prototype.msg_;


/**
 * Name of the logger that created the record.
 * @type {string}
 * @private
 */
goog.debug.LogRecord.prototype.loggerName_;


/**
 * Sequence number for the LogRecord. Each record has a unique sequence number
 * that is greater than all log records created before it.
 * @type {number}
 * @private
 */
goog.debug.LogRecord.prototype.sequenceNumber_ = 0;


/**
 * Exception associated with the record
 * @type {Object}
 * @private
 */
goog.debug.LogRecord.prototype.exception_ = null;


/**
 * Exception text associated with the record
 * @type {?string}
 * @private
 */
goog.debug.LogRecord.prototype.exceptionText_ = null;


/**
 * @define {boolean} Whether to enable log sequence numbers.
 */
goog.debug.LogRecord.ENABLE_SEQUENCE_NUMBERS = true;


/**
 * A sequence counter for assigning increasing sequence numbers to LogRecord
 * objects.
 * @type {number}
 * @private
 */
goog.debug.LogRecord.nextSequenceNumber_ = 0;


/**
 * Sets all fields of the log record.
 * @param {goog.debug.Logger.Level} level One of the level identifiers.
 * @param {string} msg The string message.
 * @param {string} loggerName The name of the source logger.
 * @param {number=} opt_time Time this log record was created if other than now.
 *     If 0, we use #goog.now.
 * @param {number=} opt_sequenceNumber Sequence number of this log record. This
 *     should only be passed in when restoring a log record from persistence.
 */
goog.debug.LogRecord.prototype.reset = function(level, msg, loggerName,
    opt_time, opt_sequenceNumber) {
  if (goog.debug.LogRecord.ENABLE_SEQUENCE_NUMBERS) {
    this.sequenceNumber_ = typeof opt_sequenceNumber == 'number' ?
        opt_sequenceNumber : goog.debug.LogRecord.nextSequenceNumber_++;
  }

  this.time_ = opt_time || goog.now();
  this.level_ = level;
  this.msg_ = msg;
  this.loggerName_ = loggerName;
  delete this.exception_;
  delete this.exceptionText_;
};


/**
 * Get the source Logger's name.
 *
 * @return {string} source logger name (may be null).
 */
goog.debug.LogRecord.prototype.getLoggerName = function() {
  return this.loggerName_;
};


/**
 * Get the exception that is part of the log record.
 *
 * @return {Object} the exception.
 */
goog.debug.LogRecord.prototype.getException = function() {
  return this.exception_;
};


/**
 * Set the exception that is part of the log record.
 *
 * @param {Object} exception the exception.
 */
goog.debug.LogRecord.prototype.setException = function(exception) {
  this.exception_ = exception;
};


/**
 * Get the exception text that is part of the log record.
 *
 * @return {?string} Exception text.
 */
goog.debug.LogRecord.prototype.getExceptionText = function() {
  return this.exceptionText_;
};


/**
 * Set the exception text that is part of the log record.
 *
 * @param {string} text The exception text.
 */
goog.debug.LogRecord.prototype.setExceptionText = function(text) {
  this.exceptionText_ = text;
};


/**
 * Get the source Logger's name.
 *
 * @param {string} loggerName source logger name (may be null).
 */
goog.debug.LogRecord.prototype.setLoggerName = function(loggerName) {
  this.loggerName_ = loggerName;
};


/**
 * Get the logging message level, for example Level.SEVERE.
 * @return {goog.debug.Logger.Level} the logging message level.
 */
goog.debug.LogRecord.prototype.getLevel = function() {
  return this.level_;
};


/**
 * Set the logging message level, for example Level.SEVERE.
 * @param {goog.debug.Logger.Level} level the logging message level.
 */
goog.debug.LogRecord.prototype.setLevel = function(level) {
  this.level_ = level;
};


/**
 * Get the "raw" log message, before localization or formatting.
 *
 * @return {string} the raw message string.
 */
goog.debug.LogRecord.prototype.getMessage = function() {
  return this.msg_;
};


/**
 * Set the "raw" log message, before localization or formatting.
 *
 * @param {string} msg the raw message string.
 */
goog.debug.LogRecord.prototype.setMessage = function(msg) {
  this.msg_ = msg;
};


/**
 * Get event time in milliseconds since 1970.
 *
 * @return {number} event time in millis since 1970.
 */
goog.debug.LogRecord.prototype.getMillis = function() {
  return this.time_;
};


/**
 * Set event time in milliseconds since 1970.
 *
 * @param {number} time event time in millis since 1970.
 */
goog.debug.LogRecord.prototype.setMillis = function(time) {
  this.time_ = time;
};


/**
 * Get the sequence number.
 * <p>
 * Sequence numbers are normally assigned in the LogRecord
 * constructor, which assigns unique sequence numbers to
 * each new LogRecord in increasing order.
 * @return {number} the sequence number.
 */
goog.debug.LogRecord.prototype.getSequenceNumber = function() {
  return this.sequenceNumber_;
};

// Copyright 2010 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview A buffer for log records. The purpose of this is to improve
 * logging performance by re-using old objects when the buffer becomes full and
 * to eliminate the need for each app to implement their own log buffer. The
 * disadvantage to doing this is that log handlers cannot maintain references to
 * log records and expect that they are not overwriten at a later point.
 *
 * @author agrieve@google.com (Andrew Grieve)
 */

goog.provide('goog.debug.LogBuffer');

goog.require('goog.asserts');
goog.require('goog.debug.LogRecord');



/**
 * Creates the log buffer.
 * @constructor
 */
goog.debug.LogBuffer = function() {
  goog.asserts.assert(goog.debug.LogBuffer.isBufferingEnabled(),
      'Cannot use goog.debug.LogBuffer without defining ' +
      'goog.debug.LogBuffer.CAPACITY.');
  this.clear();
};


/**
 * A static method that always returns the same instance of LogBuffer.
 * @return {!goog.debug.LogBuffer} The LogBuffer singleton instance.
 */
goog.debug.LogBuffer.getInstance = function() {
  if (!goog.debug.LogBuffer.instance_) {
    // This function is written with the return statement after the assignment
    // to avoid the jscompiler StripCode bug described in http://b/2608064.
    // After that bug is fixed this can be refactored.
    goog.debug.LogBuffer.instance_ = new goog.debug.LogBuffer();
  }
  return goog.debug.LogBuffer.instance_;
};


/**
 * @define {number} The number of log records to buffer. 0 means disable
 * buffering.
 */
goog.debug.LogBuffer.CAPACITY = 0;


/**
 * The array to store the records.
 * @type {!Array.<!goog.debug.LogRecord|undefined>}
 * @private
 */
goog.debug.LogBuffer.prototype.buffer_;


/**
 * The index of the most recently added record or -1 if there are no records.
 * @type {number}
 * @private
 */
goog.debug.LogBuffer.prototype.curIndex_;


/**
 * Whether the buffer is at capacity.
 * @type {boolean}
 * @private
 */
goog.debug.LogBuffer.prototype.isFull_;


/**
 * Adds a log record to the buffer, possibly overwriting the oldest record.
 * @param {goog.debug.Logger.Level} level One of the level identifiers.
 * @param {string} msg The string message.
 * @param {string} loggerName The name of the source logger.
 * @return {!goog.debug.LogRecord} The log record.
 */
goog.debug.LogBuffer.prototype.addRecord = function(level, msg, loggerName) {
  var curIndex = (this.curIndex_ + 1) % goog.debug.LogBuffer.CAPACITY;
  this.curIndex_ = curIndex;
  if (this.isFull_) {
    var ret = this.buffer_[curIndex];
    ret.reset(level, msg, loggerName);
    return ret;
  }
  this.isFull_ = curIndex == goog.debug.LogBuffer.CAPACITY - 1;
  return this.buffer_[curIndex] =
      new goog.debug.LogRecord(level, msg, loggerName);
};


/**
 * @return {boolean} Whether the log buffer is enabled.
 */
goog.debug.LogBuffer.isBufferingEnabled = function() {
  return goog.debug.LogBuffer.CAPACITY > 0;
};


/**
 * Removes all buffered log records.
 */
goog.debug.LogBuffer.prototype.clear = function() {
  this.buffer_ = new Array(goog.debug.LogBuffer.CAPACITY);
  this.curIndex_ = -1;
  this.isFull_ = false;
};


/**
 * Calls the given function for each buffered log record, starting with the
 * oldest one.
 * @param {function(!goog.debug.LogRecord)} func The function to call.
 */
goog.debug.LogBuffer.prototype.forEachRecord = function(func) {
  var buffer = this.buffer_;
  // Corner case: no records.
  if (!buffer[0]) {
    return;
  }
  var curIndex = this.curIndex_;
  var i = this.isFull_ ? curIndex : -1;
  do {
    i = (i + 1) % goog.debug.LogBuffer.CAPACITY;
    func(/** @type {!goog.debug.LogRecord} */ (buffer[i]));
  } while (i != curIndex);
};

// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Definition of the Logger class. Please minimize dependencies
 * this file has on other closure classes as any dependency it takes won't be
 * able to use the logging infrastructure.
 *
 * @see ../demos/debug.html
 */

goog.provide('goog.debug.LogManager');
goog.provide('goog.debug.Logger');
goog.provide('goog.debug.Logger.Level');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.debug');
goog.require('goog.debug.LogBuffer');
goog.require('goog.debug.LogRecord');



/**
 * The Logger is an object used for logging debug messages. Loggers are
 * normally named, using a hierarchical dot-separated namespace. Logger names
 * can be arbitrary strings, but they should normally be based on the package
 * name or class name of the logged component, such as goog.net.BrowserChannel.
 *
 * The Logger object is loosely based on the java class
 * java.util.logging.Logger. It supports different levels of filtering for
 * different loggers.
 *
 * The logger object should never be instantiated by application code. It
 * should always use the goog.debug.Logger.getLogger function.
 *
 * @constructor
 * @param {string} name The name of the Logger.
 */
goog.debug.Logger = function(name) {
  /**
   * Name of the Logger. Generally a dot-separated namespace
   * @type {string}
   * @private
   */
  this.name_ = name;
};


/**
 * Parent Logger.
 * @type {goog.debug.Logger}
 * @private
 */
goog.debug.Logger.prototype.parent_ = null;


/**
 * Level that this logger only filters above. Null indicates it should
 * inherit from the parent.
 * @type {goog.debug.Logger.Level}
 * @private
 */
goog.debug.Logger.prototype.level_ = null;


/**
 * Map of children loggers. The keys are the leaf names of the children and
 * the values are the child loggers.
 * @type {Object}
 * @private
 */
goog.debug.Logger.prototype.children_ = null;


/**
 * Handlers that are listening to this logger.
 * @type {Array.<Function>}
 * @private
 */
goog.debug.Logger.prototype.handlers_ = null;


/**
 * @define {boolean} Toggles whether loggers other than the root logger can have
 *     log handlers attached to them and whether they can have their log level
 *     set. Logging is a bit faster when this is set to false.
 */
goog.debug.Logger.ENABLE_HIERARCHY = true;


if (!goog.debug.Logger.ENABLE_HIERARCHY) {
  /**
   * @type {!Array.<Function>}
   * @private
   */
  goog.debug.Logger.rootHandlers_ = [];


  /**
   * @type {goog.debug.Logger.Level}
   * @private
   */
  goog.debug.Logger.rootLevel_;
}



/**
 * The Level class defines a set of standard logging levels that
 * can be used to control logging output.  The logging Level objects
 * are ordered and are specified by ordered integers.  Enabling logging
 * at a given level also enables logging at all higher levels.
 * <p>
 * Clients should normally use the predefined Level constants such
 * as Level.SEVERE.
 * <p>
 * The levels in descending order are:
 * <ul>
 * <li>SEVERE (highest value)
 * <li>WARNING
 * <li>INFO
 * <li>CONFIG
 * <li>FINE
 * <li>FINER
 * <li>FINEST  (lowest value)
 * </ul>
 * In addition there is a level OFF that can be used to turn
 * off logging, and a level ALL that can be used to enable
 * logging of all messages.
 *
 * @param {string} name The name of the level.
 * @param {number} value The numeric value of the level.
 * @constructor
 */
goog.debug.Logger.Level = function(name, value) {
  /**
   * The name of the level
   * @type {string}
   */
  this.name = name;

  /**
   * The numeric value of the level
   * @type {number}
   */
  this.value = value;
};


/**
 * @return {string} String representation of the logger level.
 */
goog.debug.Logger.Level.prototype.toString = function() {
  return this.name;
};


/**
 * OFF is a special level that can be used to turn off logging.
 * This level is initialized to <CODE>Number.MAX_VALUE</CODE>.
 * @type {!goog.debug.Logger.Level}
 */
goog.debug.Logger.Level.OFF =
    new goog.debug.Logger.Level('OFF', Infinity);


/**
 * SHOUT is a message level for extra debugging loudness.
 * This level is initialized to <CODE>1200</CODE>.
 * @type {!goog.debug.Logger.Level}
 */
goog.debug.Logger.Level.SHOUT = new goog.debug.Logger.Level('SHOUT', 1200);


/**
 * SEVERE is a message level indicating a serious failure.
 * This level is initialized to <CODE>1000</CODE>.
 * @type {!goog.debug.Logger.Level}
 */
goog.debug.Logger.Level.SEVERE = new goog.debug.Logger.Level('SEVERE', 1000);


/**
 * WARNING is a message level indicating a potential problem.
 * This level is initialized to <CODE>900</CODE>.
 * @type {!goog.debug.Logger.Level}
 */
goog.debug.Logger.Level.WARNING = new goog.debug.Logger.Level('WARNING', 900);


/**
 * INFO is a message level for informational messages.
 * This level is initialized to <CODE>800</CODE>.
 * @type {!goog.debug.Logger.Level}
 */
goog.debug.Logger.Level.INFO = new goog.debug.Logger.Level('INFO', 800);


/**
 * CONFIG is a message level for static configuration messages.
 * This level is initialized to <CODE>700</CODE>.
 * @type {!goog.debug.Logger.Level}
 */
goog.debug.Logger.Level.CONFIG = new goog.debug.Logger.Level('CONFIG', 700);


/**
 * FINE is a message level providing tracing information.
 * This level is initialized to <CODE>500</CODE>.
 * @type {!goog.debug.Logger.Level}
 */
goog.debug.Logger.Level.FINE = new goog.debug.Logger.Level('FINE', 500);


/**
 * FINER indicates a fairly detailed tracing message.
 * This level is initialized to <CODE>400</CODE>.
 * @type {!goog.debug.Logger.Level}
 */
goog.debug.Logger.Level.FINER = new goog.debug.Logger.Level('FINER', 400);

/**
 * FINEST indicates a highly detailed tracing message.
 * This level is initialized to <CODE>300</CODE>.
 * @type {!goog.debug.Logger.Level}
 */

goog.debug.Logger.Level.FINEST = new goog.debug.Logger.Level('FINEST', 300);


/**
 * ALL indicates that all messages should be logged.
 * This level is initialized to <CODE>Number.MIN_VALUE</CODE>.
 * @type {!goog.debug.Logger.Level}
 */
goog.debug.Logger.Level.ALL = new goog.debug.Logger.Level('ALL', 0);


/**
 * The predefined levels.
 * @type {!Array.<!goog.debug.Logger.Level>}
 * @final
 */
goog.debug.Logger.Level.PREDEFINED_LEVELS = [
  goog.debug.Logger.Level.OFF,
  goog.debug.Logger.Level.SHOUT,
  goog.debug.Logger.Level.SEVERE,
  goog.debug.Logger.Level.WARNING,
  goog.debug.Logger.Level.INFO,
  goog.debug.Logger.Level.CONFIG,
  goog.debug.Logger.Level.FINE,
  goog.debug.Logger.Level.FINER,
  goog.debug.Logger.Level.FINEST,
  goog.debug.Logger.Level.ALL];


/**
 * A lookup map used to find the level object based on the name or value of
 * the level object.
 * @type {Object}
 * @private
 */
goog.debug.Logger.Level.predefinedLevelsCache_ = null;


/**
 * Creates the predefined levels cache and populates it.
 * @private
 */
goog.debug.Logger.Level.createPredefinedLevelsCache_ = function() {
  goog.debug.Logger.Level.predefinedLevelsCache_ = {};
  for (var i = 0, level; level = goog.debug.Logger.Level.PREDEFINED_LEVELS[i];
       i++) {
    goog.debug.Logger.Level.predefinedLevelsCache_[level.value] = level;
    goog.debug.Logger.Level.predefinedLevelsCache_[level.name] = level;
  }
};


/**
 * Gets the predefined level with the given name.
 * @param {string} name The name of the level.
 * @return {goog.debug.Logger.Level} The level, or null if none found.
 */
goog.debug.Logger.Level.getPredefinedLevel = function(name) {
  if (!goog.debug.Logger.Level.predefinedLevelsCache_) {
    goog.debug.Logger.Level.createPredefinedLevelsCache_();
  }

  return goog.debug.Logger.Level.predefinedLevelsCache_[name] || null;
};


/**
 * Gets the highest predefined level <= #value.
 * @param {number} value Level value.
 * @return {goog.debug.Logger.Level} The level, or null if none found.
 */
goog.debug.Logger.Level.getPredefinedLevelByValue = function(value) {
  if (!goog.debug.Logger.Level.predefinedLevelsCache_) {
    goog.debug.Logger.Level.createPredefinedLevelsCache_();
  }

  if (value in goog.debug.Logger.Level.predefinedLevelsCache_) {
    return goog.debug.Logger.Level.predefinedLevelsCache_[value];
  }

  for (var i = 0; i < goog.debug.Logger.Level.PREDEFINED_LEVELS.length; ++i) {
    var level = goog.debug.Logger.Level.PREDEFINED_LEVELS[i];
    if (level.value <= value) {
      return level;
    }
  }
  return null;
};


/**
 * Find or create a logger for a named subsystem. If a logger has already been
 * created with the given name it is returned. Otherwise a new logger is
 * created. If a new logger is created its log level will be configured based
 * on the LogManager configuration and it will configured to also send logging
 * output to its parent's handlers. It will be registered in the LogManager
 * global namespace.
 *
 * @param {string} name A name for the logger. This should be a dot-separated
 * name and should normally be based on the package name or class name of the
 * subsystem, such as goog.net.BrowserChannel.
 * @return {!goog.debug.Logger} The named logger.
 */
goog.debug.Logger.getLogger = function(name) {
  return goog.debug.LogManager.getLogger(name);
};


/**
 * Logs a message to profiling tools, if available.
 * {@see http://code.google.com/webtoolkit/speedtracer/logging-api.html}
 * {@see http://msdn.microsoft.com/en-us/library/dd433074(VS.85).aspx}
 * @param {string} msg The message to log.
 */
goog.debug.Logger.logToProfilers = function(msg) {
  // Using goog.global, as loggers might be used in window-less contexts.
  if (goog.global['console']) {
    if (goog.global['console']['timeStamp']) {
      // Logs a message to Firebug, Web Inspector, SpeedTracer, etc.
      goog.global['console']['timeStamp'](msg);
    } else if (goog.global['console']['markTimeline']) {
      // TODO(user): markTimeline is deprecated. Drop this else clause entirely
      // after Chrome M14 hits stable.
      goog.global['console']['markTimeline'](msg);
    }
  }

  if (goog.global['msWriteProfilerMark']) {
    // Logs a message to the Microsoft profiler
    goog.global['msWriteProfilerMark'](msg);
  }
};


/**
 * Gets the name of this logger.
 * @return {string} The name of this logger.
 */
goog.debug.Logger.prototype.getName = function() {
  return this.name_;
};


/**
 * Adds a handler to the logger. This doesn't use the event system because
 * we want to be able to add logging to the event system.
 * @param {Function} handler Handler function to add.
 */
goog.debug.Logger.prototype.addHandler = function(handler) {
  if (goog.debug.Logger.ENABLE_HIERARCHY) {
    if (!this.handlers_) {
      this.handlers_ = [];
    }
    this.handlers_.push(handler);
  } else {
    goog.asserts.assert(!this.name_,
        'Cannot call addHandler on a non-root logger when ' +
        'goog.debug.Logger.ENABLE_HIERARCHY is false.');
    goog.debug.Logger.rootHandlers_.push(handler);
  }
};


/**
 * Removes a handler from the logger. This doesn't use the event system because
 * we want to be able to add logging to the event system.
 * @param {Function} handler Handler function to remove.
 * @return {boolean} Whether the handler was removed.
 */
goog.debug.Logger.prototype.removeHandler = function(handler) {
  var handlers = goog.debug.Logger.ENABLE_HIERARCHY ? this.handlers_ :
      goog.debug.Logger.rootHandlers_;
  return !!handlers && goog.array.remove(handlers, handler);
};


/**
 * Returns the parent of this logger.
 * @return {goog.debug.Logger} The parent logger or null if this is the root.
 */
goog.debug.Logger.prototype.getParent = function() {
  return this.parent_;
};


/**
 * Returns the children of this logger as a map of the child name to the logger.
 * @return {!Object} The map where the keys are the child leaf names and the
 *     values are the Logger objects.
 */
goog.debug.Logger.prototype.getChildren = function() {
  if (!this.children_) {
    this.children_ = {};
  }
  return this.children_;
};


/**
 * Set the log level specifying which message levels will be logged by this
 * logger. Message levels lower than this value will be discarded.
 * The level value Level.OFF can be used to turn off logging. If the new level
 * is null, it means that this node should inherit its level from its nearest
 * ancestor with a specific (non-null) level value.
 *
 * @param {goog.debug.Logger.Level} level The new level.
 */
goog.debug.Logger.prototype.setLevel = function(level) {
  if (goog.debug.Logger.ENABLE_HIERARCHY) {
    this.level_ = level;
  } else {
    goog.asserts.assert(!this.name_,
        'Cannot call setLevel() on a non-root logger when ' +
        'goog.debug.Logger.ENABLE_HIERARCHY is false.');
    goog.debug.Logger.rootLevel_ = level;
  }
};


/**
 * Gets the log level specifying which message levels will be logged by this
 * logger. Message levels lower than this value will be discarded.
 * The level value Level.OFF can be used to turn off logging. If the level
 * is null, it means that this node should inherit its level from its nearest
 * ancestor with a specific (non-null) level value.
 *
 * @return {goog.debug.Logger.Level} The level.
 */
goog.debug.Logger.prototype.getLevel = function() {
  return this.level_;
};


/**
 * Returns the effective level of the logger based on its ancestors' levels.
 * @return {goog.debug.Logger.Level} The level.
 */
goog.debug.Logger.prototype.getEffectiveLevel = function() {
  if (!goog.debug.Logger.ENABLE_HIERARCHY) {
    return goog.debug.Logger.rootLevel_;
  }
  if (this.level_) {
    return this.level_;
  }
  if (this.parent_) {
    return this.parent_.getEffectiveLevel();
  }
  goog.asserts.fail('Root logger has no level set.');
  return null;
};


/**
 * Check if a message of the given level would actually be logged by this
 * logger. This check is based on the Loggers effective level, which may be
 * inherited from its parent.
 * @param {goog.debug.Logger.Level} level The level to check.
 * @return {boolean} Whether the message would be logged.
 */
goog.debug.Logger.prototype.isLoggable = function(level) {
  return level.value >= this.getEffectiveLevel().value;
};


/**
 * Log a message. If the logger is currently enabled for the
 * given message level then the given message is forwarded to all the
 * registered output Handler objects.
 * @param {goog.debug.Logger.Level} level One of the level identifiers.
 * @param {string} msg The string message.
 * @param {Error|Object=} opt_exception An exception associated with the
 *     message.
 */
goog.debug.Logger.prototype.log = function(level, msg, opt_exception) {
  // java caches the effective level, not sure it's necessary here
  if (this.isLoggable(level)) {
    this.doLogRecord_(this.getLogRecord(level, msg, opt_exception));
  }
};


/**
 * Creates a new log record and adds the exception (if present) to it.
 * @param {goog.debug.Logger.Level} level One of the level identifiers.
 * @param {string} msg The string message.
 * @param {Error|Object=} opt_exception An exception associated with the
 *     message.
 * @return {!goog.debug.LogRecord} A log record.
 */
goog.debug.Logger.prototype.getLogRecord = function(level, msg, opt_exception) {
  if (goog.debug.LogBuffer.isBufferingEnabled()) {
    var logRecord =
        goog.debug.LogBuffer.getInstance().addRecord(level, msg, this.name_);
  } else {
    logRecord = new goog.debug.LogRecord(level, String(msg), this.name_);
  }
  if (opt_exception) {
    logRecord.setException(opt_exception);
    logRecord.setExceptionText(
        goog.debug.exposeException(opt_exception, arguments.callee.caller));
  }
  return logRecord;
};


/**
 * Log a message at the Logger.Level.SHOUT level.
 * If the logger is currently enabled for the given message level then the
 * given message is forwarded to all the registered output Handler objects.
 * @param {string} msg The string message.
 * @param {Error=} opt_exception An exception associated with the message.
 */
goog.debug.Logger.prototype.shout = function(msg, opt_exception) {
  this.log(goog.debug.Logger.Level.SHOUT, msg, opt_exception);
};


/**
 * Log a message at the Logger.Level.SEVERE level.
 * If the logger is currently enabled for the given message level then the
 * given message is forwarded to all the registered output Handler objects.
 * @param {string} msg The string message.
 * @param {Error=} opt_exception An exception associated with the message.
 */
goog.debug.Logger.prototype.severe = function(msg, opt_exception) {
  this.log(goog.debug.Logger.Level.SEVERE, msg, opt_exception);
};


/**
 * Log a message at the Logger.Level.WARNING level.
 * If the logger is currently enabled for the given message level then the
 * given message is forwarded to all the registered output Handler objects.
 * @param {string} msg The string message.
 * @param {Error=} opt_exception An exception associated with the message.
 */
goog.debug.Logger.prototype.warning = function(msg, opt_exception) {
  this.log(goog.debug.Logger.Level.WARNING, msg, opt_exception);
};


/**
 * Log a message at the Logger.Level.INFO level.
 * If the logger is currently enabled for the given message level then the
 * given message is forwarded to all the registered output Handler objects.
 * @param {string} msg The string message.
 * @param {Error=} opt_exception An exception associated with the message.
 */
goog.debug.Logger.prototype.info = function(msg, opt_exception) {
  this.log(goog.debug.Logger.Level.INFO, msg, opt_exception);
};


/**
 * Log a message at the Logger.Level.CONFIG level.
 * If the logger is currently enabled for the given message level then the
 * given message is forwarded to all the registered output Handler objects.
 * @param {string} msg The string message.
 * @param {Error=} opt_exception An exception associated with the message.
 */
goog.debug.Logger.prototype.config = function(msg, opt_exception) {
  this.log(goog.debug.Logger.Level.CONFIG, msg, opt_exception);
};


/**
 * Log a message at the Logger.Level.FINE level.
 * If the logger is currently enabled for the given message level then the
 * given message is forwarded to all the registered output Handler objects.
 * @param {string} msg The string message.
 * @param {Error=} opt_exception An exception associated with the message.
 */
goog.debug.Logger.prototype.fine = function(msg, opt_exception) {
  this.log(goog.debug.Logger.Level.FINE, msg, opt_exception);
};


/**
 * Log a message at the Logger.Level.FINER level.
 * If the logger is currently enabled for the given message level then the
 * given message is forwarded to all the registered output Handler objects.
 * @param {string} msg The string message.
 * @param {Error=} opt_exception An exception associated with the message.
 */
goog.debug.Logger.prototype.finer = function(msg, opt_exception) {
  this.log(goog.debug.Logger.Level.FINER, msg, opt_exception);
};


/**
 * Log a message at the Logger.Level.FINEST level.
 * If the logger is currently enabled for the given message level then the
 * given message is forwarded to all the registered output Handler objects.
 * @param {string} msg The string message.
 * @param {Error=} opt_exception An exception associated with the message.
 */
goog.debug.Logger.prototype.finest = function(msg, opt_exception) {
  this.log(goog.debug.Logger.Level.FINEST, msg, opt_exception);
};


/**
 * Log a LogRecord. If the logger is currently enabled for the
 * given message level then the given message is forwarded to all the
 * registered output Handler objects.
 * @param {goog.debug.LogRecord} logRecord A log record to log.
 */
goog.debug.Logger.prototype.logRecord = function(logRecord) {
  if (this.isLoggable(logRecord.getLevel())) {
    this.doLogRecord_(logRecord);
  }
};


/**
 * Log a LogRecord.
 * @param {goog.debug.LogRecord} logRecord A log record to log.
 * @private
 */
goog.debug.Logger.prototype.doLogRecord_ = function(logRecord) {
  goog.debug.Logger.logToProfilers('log:' + logRecord.getMessage());
  if (goog.debug.Logger.ENABLE_HIERARCHY) {
    var target = this;
    while (target) {
      target.callPublish_(logRecord);
      target = target.getParent();
    }
  } else {
    for (var i = 0, handler; handler = goog.debug.Logger.rootHandlers_[i++]; ) {
      handler(logRecord);
    }
  }
};


/**
 * Calls the handlers for publish.
 * @param {goog.debug.LogRecord} logRecord The log record to publish.
 * @private
 */
goog.debug.Logger.prototype.callPublish_ = function(logRecord) {
  if (this.handlers_) {
    for (var i = 0, handler; handler = this.handlers_[i]; i++) {
      handler(logRecord);
    }
  }
};


/**
 * Sets the parent of this logger. This is used for setting up the logger tree.
 * @param {goog.debug.Logger} parent The parent logger.
 * @private
 */
goog.debug.Logger.prototype.setParent_ = function(parent) {
  this.parent_ = parent;
};


/**
 * Adds a child to this logger. This is used for setting up the logger tree.
 * @param {string} name The leaf name of the child.
 * @param {goog.debug.Logger} logger The child logger.
 * @private
 */
goog.debug.Logger.prototype.addChild_ = function(name, logger) {
  this.getChildren()[name] = logger;
};


/**
 * There is a single global LogManager object that is used to maintain a set of
 * shared state about Loggers and log services. This is loosely based on the
 * java class java.util.logging.LogManager.
 */
goog.debug.LogManager = {};


/**
 * Map of logger names to logger objects
 *
 * @type {!Object}
 * @private
 */
goog.debug.LogManager.loggers_ = {};


/**
 * The root logger which is the root of the logger tree.
 * @type {goog.debug.Logger}
 * @private
 */
goog.debug.LogManager.rootLogger_ = null;


/**
 * Initialize the LogManager if not already initialized
 */
goog.debug.LogManager.initialize = function() {
  if (!goog.debug.LogManager.rootLogger_) {
    goog.debug.LogManager.rootLogger_ = new goog.debug.Logger('');
    goog.debug.LogManager.loggers_[''] = goog.debug.LogManager.rootLogger_;
    goog.debug.LogManager.rootLogger_.setLevel(goog.debug.Logger.Level.CONFIG);
  }
};


/**
 * Returns all the loggers
 * @return {!Object} Map of logger names to logger objects.
 */
goog.debug.LogManager.getLoggers = function() {
  return goog.debug.LogManager.loggers_;
};


/**
 * Returns the root of the logger tree namespace, the logger with the empty
 * string as its name
 *
 * @return {!goog.debug.Logger} The root logger.
 */
goog.debug.LogManager.getRoot = function() {
  goog.debug.LogManager.initialize();
  return /** @type {!goog.debug.Logger} */ (goog.debug.LogManager.rootLogger_);
};


/**
 * Method to find a named logger.
 *
 * @param {string} name A name for the logger. This should be a dot-separated
 * name and should normally be based on the package name or class name of the
 * subsystem, such as goog.net.BrowserChannel.
 * @return {!goog.debug.Logger} The named logger.
 */
goog.debug.LogManager.getLogger = function(name) {
  goog.debug.LogManager.initialize();
  var ret = goog.debug.LogManager.loggers_[name];
  return ret || goog.debug.LogManager.createLogger_(name);
};


/**
 * Creates a function that can be passed to goog.debug.catchErrors. The function
 * will log all reported errors using the given logger.
 * @param {goog.debug.Logger=} opt_logger The logger to log the errors to.
 *     Defaults to the root logger.
 * @return {function(Object)} The created function.
 */
goog.debug.LogManager.createFunctionForCatchErrors = function(opt_logger) {
  return function(info) {
    var logger = opt_logger || goog.debug.LogManager.getRoot();
    logger.severe('Error: ' + info.message + ' (' + info.fileName +
                  ' @ Line: ' + info.line + ')');
  };
};


/**
 * Creates the named logger. Will also create the parents of the named logger
 * if they don't yet exist.
 * @param {string} name The name of the logger.
 * @return {!goog.debug.Logger} The named logger.
 * @private
 */
goog.debug.LogManager.createLogger_ = function(name) {
  // find parent logger
  var logger = new goog.debug.Logger(name);
  if (goog.debug.Logger.ENABLE_HIERARCHY) {
    var lastDotIndex = name.lastIndexOf('.');
    var parentName = name.substr(0, lastDotIndex);
    var leafName = name.substr(lastDotIndex + 1);
    var parentLogger = goog.debug.LogManager.getLogger(parentName);

    // tell the parent about the child and the child about the parent
    parentLogger.addChild_(leafName, logger);
    logger.setParent_(parentLogger);
  }

  goog.debug.LogManager.loggers_[name] = logger;
  return logger;
};
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Wrapper class for handling XmlHttpRequests.
 *
 * One off requests can be sent through goog.net.XhrIo.send() or an
 * instance can be created to send multiple requests.  Each request uses its
 * own XmlHttpRequest object and handles clearing of the event callback to
 * ensure no leaks.
 *
 * XhrIo is event based, it dispatches events when a request finishes, fails or
 * succeeds or when the ready-state changes. The ready-state or timeout event
 * fires first, followed by a generic completed event. Then the abort, error,
 * or success event is fired as appropriate. Lastly, the ready event will fire
 * to indicate that the object may be used to make another request.
 *
 * The error event may also be called before completed and
 * ready-state-change if the XmlHttpRequest.open() or .send() methods throw.
 *
 * This class does not support multiple requests, queuing, or prioritization.
 *
 * Tested = IE6, FF1.5, Safari, Opera 8.5
 *
 * TODO(user): Error cases aren't playing nicely in Safari.
 *
 */


goog.provide('goog.net.XhrIo');
goog.provide('goog.net.XhrIo.ResponseType');

goog.require('goog.Timer');
goog.require('goog.debug.Logger');
goog.require('goog.debug.entryPointRegistry');
goog.require('goog.debug.errorHandlerWeakDep');
goog.require('goog.events.EventTarget');
goog.require('goog.json');
goog.require('goog.net.ErrorCode');
goog.require('goog.net.EventType');
goog.require('goog.net.HttpStatus');
goog.require('goog.net.XmlHttp');
goog.require('goog.object');
goog.require('goog.structs');
goog.require('goog.structs.Map');
goog.require('goog.uri.utils');



/**
 * Basic class for handling XMLHttpRequests.
 * @param {goog.net.XmlHttpFactory=} opt_xmlHttpFactory Factory to use when
 *     creating XMLHttpRequest objects.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.net.XhrIo = function(opt_xmlHttpFactory) {
  goog.events.EventTarget.call(this);

  /**
   * Map of default headers to add to every request, use:
   * XhrIo.headers.set(name, value)
   * @type {goog.structs.Map}
   */
  this.headers = new goog.structs.Map();

  /**
   * Optional XmlHttpFactory
   * @type {goog.net.XmlHttpFactory}
   * @private
   */
  this.xmlHttpFactory_ = opt_xmlHttpFactory || null;
};
goog.inherits(goog.net.XhrIo, goog.events.EventTarget);


/**
 * Response types that may be requested for XMLHttpRequests.
 * @enum {string}
 * @see http://www.w3.org/TR/XMLHttpRequest/#the-responsetype-attribute
 */
goog.net.XhrIo.ResponseType = {
  DEFAULT: '',
  TEXT: 'text',
  DOCUMENT: 'document',
  // Not supported as of Chrome 10.0.612.1 dev
  BLOB: 'blob',
  ARRAY_BUFFER: 'arraybuffer'
};


/**
 * A reference to the XhrIo logger
 * @type {goog.debug.Logger}
 * @private
 */
goog.net.XhrIo.prototype.logger_ =
    goog.debug.Logger.getLogger('goog.net.XhrIo');


/**
 * The Content-Type HTTP header name
 * @type {string}
 */
goog.net.XhrIo.CONTENT_TYPE_HEADER = 'Content-Type';


/**
 * The pattern matching the 'http' and 'https' URI schemes
 * @type {!RegExp}
 */
goog.net.XhrIo.HTTP_SCHEME_PATTERN = /^https?$/i;


/**
 * The Content-Type HTTP header value for a url-encoded form
 * @type {string}
 */
goog.net.XhrIo.FORM_CONTENT_TYPE =
    'application/x-www-form-urlencoded;charset=utf-8';


/**
 * All non-disposed instances of goog.net.XhrIo created
 * by {@link goog.net.XhrIo.send} are in this Array.
 * @see goog.net.XhrIo.cleanup
 * @type {Array.<goog.net.XhrIo>}
 * @private
 */
goog.net.XhrIo.sendInstances_ = [];


/**
 * Static send that creates a short lived instance of XhrIo to send the
 * request.
 * @see goog.net.XhrIo.cleanup
 * @param {string|goog.Uri} url Uri to make request to.
 * @param {Function=} opt_callback Callback function for when request is
 *     complete.
 * @param {string=} opt_method Send method, default: GET.
 * @param {string|GearsBlob=} opt_content Post data. This can be a Gears blob
 *     if the underlying HTTP request object is a Gears HTTP request.
 * @param {Object|goog.structs.Map=} opt_headers Map of headers to add to the
 *     request.
 * @param {number=} opt_timeoutInterval Number of milliseconds after which an
 *     incomplete request will be aborted; 0 means no timeout is set.
 */
goog.net.XhrIo.send = function(url, opt_callback, opt_method, opt_content,
                               opt_headers, opt_timeoutInterval) {
  var x = new goog.net.XhrIo();
  goog.net.XhrIo.sendInstances_.push(x);
  if (opt_callback) {
    goog.events.listen(x, goog.net.EventType.COMPLETE, opt_callback);
  }
  goog.events.listen(x,
                     goog.net.EventType.READY,
                     goog.partial(goog.net.XhrIo.cleanupSend_, x));
  if (opt_timeoutInterval) {
    x.setTimeoutInterval(opt_timeoutInterval);
  }
  x.send(url, opt_method, opt_content, opt_headers);
};


/**
 * Disposes all non-disposed instances of goog.net.XhrIo created by
 * {@link goog.net.XhrIo.send}.
 * {@link goog.net.XhrIo.send} cleans up the goog.net.XhrIo instance
 * it creates when the request completes or fails.  However, if
 * the request never completes, then the goog.net.XhrIo is not disposed.
 * This can occur if the window is unloaded before the request completes.
 * We could have {@link goog.net.XhrIo.send} return the goog.net.XhrIo
 * it creates and make the client of {@link goog.net.XhrIo.send} be
 * responsible for disposing it in this case.  However, this makes things
 * significantly more complicated for the client, and the whole point
 * of {@link goog.net.XhrIo.send} is that it's simple and easy to use.
 * Clients of {@link goog.net.XhrIo.send} should call
 * {@link goog.net.XhrIo.cleanup} when doing final
 * cleanup on window unload.
 */
goog.net.XhrIo.cleanup = function() {
  var instances = goog.net.XhrIo.sendInstances_;
  while (instances.length) {
    instances.pop().dispose();
  }
};


/**
 * Installs exception protection for all entry point introduced by
 * goog.net.XhrIo instances which are not protected by
 * {@link goog.debug.ErrorHandler#protectWindowSetTimeout},
 * {@link goog.debug.ErrorHandler#protectWindowSetInterval}, or
 * {@link goog.events.protectBrowserEventEntryPoint}.
 *
 * @param {goog.debug.ErrorHandler} errorHandler Error handler with which to
 *     protect the entry point(s).
 */
goog.net.XhrIo.protectEntryPoints = function(errorHandler) {
  goog.net.XhrIo.prototype.onReadyStateChangeEntryPoint_ =
      errorHandler.protectEntryPoint(
          goog.net.XhrIo.prototype.onReadyStateChangeEntryPoint_);
};


/**
 * Disposes of the specified goog.net.XhrIo created by
 * {@link goog.net.XhrIo.send} and removes it from
 * {@link goog.net.XhrIo.pendingStaticSendInstances_}.
 * @param {goog.net.XhrIo} XhrIo An XhrIo created by
 *     {@link goog.net.XhrIo.send}.
 * @private
 */
goog.net.XhrIo.cleanupSend_ = function(XhrIo) {
  XhrIo.dispose();
  goog.array.remove(goog.net.XhrIo.sendInstances_, XhrIo);
};


/**
 * Whether XMLHttpRequest is active.  A request is active from the time send()
 * is called until onReadyStateChange() is complete, or error() or abort()
 * is called.
 * @type {boolean}
 * @private
 */
goog.net.XhrIo.prototype.active_ = false;


/**
 * Reference to an XMLHttpRequest object that is being used for the transfer.
 * @type {XMLHttpRequest|GearsHttpRequest}
 * @private
 */
goog.net.XhrIo.prototype.xhr_ = null;


/**
 * The options to use with the current XMLHttpRequest object.
 * @type {Object}
 * @private
 */
goog.net.XhrIo.prototype.xhrOptions_ = null;


/**
 * Last URL that was requested.
 * @type {string|goog.Uri}
 * @private
 */
goog.net.XhrIo.prototype.lastUri_ = '';


/**
 * Method for the last request.
 * @type {string}
 * @private
 */
goog.net.XhrIo.prototype.lastMethod_ = '';


/**
 * Last error code.
 * @type {goog.net.ErrorCode}
 * @private
 */
goog.net.XhrIo.prototype.lastErrorCode_ = goog.net.ErrorCode.NO_ERROR;


/**
 * Last error message.
 * @type {Error|string}
 * @private
 */
goog.net.XhrIo.prototype.lastError_ = '';


/**
 * This is used to ensure that we don't dispatch an multiple ERROR events. This
 * can happen in IE when it does a synchronous load and one error is handled in
 * the ready statte change and one is handled due to send() throwing an
 * exception.
 * @type {boolean}
 * @private
 */
goog.net.XhrIo.prototype.errorDispatched_ = false;


/**
 * Used to make sure we don't fire the complete event from inside a send call.
 * @type {boolean}
 * @private
 */
goog.net.XhrIo.prototype.inSend_ = false;


/**
 * Used in determining if a call to {@link #onReadyStateChange_} is from within
 * a call to this.xhr_.open.
 * @type {boolean}
 * @private
 */
goog.net.XhrIo.prototype.inOpen_ = false;


/**
 * Used in determining if a call to {@link #onReadyStateChange_} is from within
 * a call to this.xhr_.abort.
 * @type {boolean}
 * @private
 */
goog.net.XhrIo.prototype.inAbort_ = false;


/**
 * Number of milliseconds after which an incomplete request will be aborted and
 * a {@link goog.net.EventType.TIMEOUT} event raised; 0 means no timeout is set.
 * @type {number}
 * @private
 */
goog.net.XhrIo.prototype.timeoutInterval_ = 0;


/**
 * Window timeout ID used to cancel the timeout event handler if the request
 * completes successfully.
 * @type {Object}
 * @private
 */
goog.net.XhrIo.prototype.timeoutId_ = null;


/**
 * The requested type for the response. The empty string means use the default
 * XHR behavior.
 * @type {goog.net.XhrIo.ResponseType}
 * @private
 */
goog.net.XhrIo.prototype.responseType_ = goog.net.XhrIo.ResponseType.DEFAULT;


/**
 * Whether a "credentialed" request is to be sent (one that is aware of cookies
 * and authentication) . This is applicable only for cross-domain requests and
 * more recent browsers that support this part of the HTTP Access Control
 * standard.
 *
 * @see http://www.w3.org/TR/XMLHttpRequest/#the-withcredentials-attribute
 *
 * @type {boolean}
 * @private
 */
goog.net.XhrIo.prototype.withCredentials_ = false;


/**
 * Returns the number of milliseconds after which an incomplete request will be
 * aborted, or 0 if no timeout is set.
 * @return {number} Timeout interval in milliseconds.
 */
goog.net.XhrIo.prototype.getTimeoutInterval = function() {
  return this.timeoutInterval_;
};


/**
 * Sets the number of milliseconds after which an incomplete request will be
 * aborted and a {@link goog.net.EventType.TIMEOUT} event raised; 0 means no
 * timeout is set.
 * @param {number} ms Timeout interval in milliseconds; 0 means none.
 */
goog.net.XhrIo.prototype.setTimeoutInterval = function(ms) {
  this.timeoutInterval_ = Math.max(0, ms);
};


/**
 * Sets the desired type for the response. At time of writing, this is only
 * supported in very recent versions of WebKit (10.0.612.1 dev and later).
 *
 * If this is used, the response may only be accessed via {@link #getResponse}.
 *
 * @param {goog.net.XhrIo.ResponseType} type The desired type for the response.
 */
goog.net.XhrIo.prototype.setResponseType = function(type) {
  this.responseType_ = type;
};


/**
 * Gets the desired type for the response.
 * @return {goog.net.XhrIo.ResponseType} The desired type for the response.
 */
goog.net.XhrIo.prototype.getResponseType = function() {
  return this.responseType_;
};


/**
 * Sets whether a "credentialed" request that is aware of cookie and
 * authentication information should be made. This option is only supported by
 * browsers that support HTTP Access Control. As of this writing, this option
 * is not supported in IE.
 *
 * @param {boolean} withCredentials Whether this should be a "credentialed"
 *     request.
 */
goog.net.XhrIo.prototype.setWithCredentials = function(withCredentials) {
  this.withCredentials_ = withCredentials;
};


/**
 * Gets whether a "credentialed" request is to be sent.
 * @return {boolean} The desired type for the response.
 */
goog.net.XhrIo.prototype.getWithCredentials = function() {
  return this.withCredentials_;
};


/**
 * Instance send that actually uses XMLHttpRequest to make a server call.
 * @param {string|goog.Uri} url Uri to make request to.
 * @param {string=} opt_method Send method, default: GET.
 * @param {string|GearsBlob=} opt_content Post data. This can be a Gears blob
 *     if the underlying HTTP request object is a Gears HTTP request.
 * @param {Object|goog.structs.Map=} opt_headers Map of headers to add to the
 *     request.
 */
goog.net.XhrIo.prototype.send = function(url, opt_method, opt_content,
                                         opt_headers) {
  if (this.xhr_) {
    throw Error('[goog.net.XhrIo] Object is active with another request');
  }

  var method = opt_method ? opt_method.toUpperCase() : 'GET';

  this.lastUri_ = url;
  this.lastError_ = '';
  this.lastErrorCode_ = goog.net.ErrorCode.NO_ERROR;
  this.lastMethod_ = method;
  this.errorDispatched_ = false;
  this.active_ = true;

  // Use the factory to create the XHR object and options
  this.xhr_ = this.createXhr();
  this.xhrOptions_ = this.xmlHttpFactory_ ?
      this.xmlHttpFactory_.getOptions() : goog.net.XmlHttp.getOptions();

  // Set up the onreadystatechange callback
  this.xhr_.onreadystatechange = goog.bind(this.onReadyStateChange_, this);

  /**
   * Try to open the XMLHttpRequest (always async), if an error occurs here it
   * is generally permission denied
   * @preserveTry
   */
  try {
    this.logger_.fine(this.formatMsg_('Opening Xhr'));
    this.inOpen_ = true;
    this.xhr_.open(method, url, true);  // Always async!
    this.inOpen_ = false;
  } catch (err) {
    this.logger_.fine(this.formatMsg_('Error opening Xhr: ' + err.message));
    this.error_(goog.net.ErrorCode.EXCEPTION, err);
    return;
  }

  // We can't use null since this won't allow POSTs to have a content length
  // specified which will cause some proxies to return a 411 error.
  var content = opt_content || '';

  var headers = this.headers.clone();

  // Add headers specific to this request
  if (opt_headers) {
    goog.structs.forEach(opt_headers, function(value, key) {
      headers.set(key, value);
    });
  }

  if (method == 'POST' &&
      !headers.containsKey(goog.net.XhrIo.CONTENT_TYPE_HEADER)) {
    // For POST requests, default to the url-encoded form content type.
    headers.set(goog.net.XhrIo.CONTENT_TYPE_HEADER,
                goog.net.XhrIo.FORM_CONTENT_TYPE);
  }

  // Add the headers to the Xhr object
  goog.structs.forEach(headers, function(value, key) {
    this.xhr_.setRequestHeader(key, value);
  }, this);

  if (this.responseType_) {
    this.xhr_.responseType = this.responseType_;
  }

  if (goog.object.containsKey(this.xhr_, 'withCredentials')) {
    this.xhr_.withCredentials = this.withCredentials_;
  }

  /**
   * Try to send the request, or other wise report an error (404 not found).
   * @preserveTry
   */
  try {
    if (this.timeoutId_) {
      // This should never happen, since the if (this.active_) above shouldn't
      // let execution reach this point if there is a request in progress...
      goog.Timer.defaultTimerObject.clearTimeout(this.timeoutId_);
      this.timeoutId_ = null;
    }
    if (this.timeoutInterval_ > 0) {
      this.logger_.fine(this.formatMsg_('Will abort after ' +
          this.timeoutInterval_ + 'ms if incomplete'));
      this.timeoutId_ = goog.Timer.defaultTimerObject.setTimeout(
          goog.bind(this.timeout_, this), this.timeoutInterval_);
    }
    this.logger_.fine(this.formatMsg_('Sending request'));
    this.inSend_ = true;
    this.xhr_.send(content);
    this.inSend_ = false;

  } catch (err) {
    this.logger_.fine(this.formatMsg_('Send error: ' + err.message));
    this.error_(goog.net.ErrorCode.EXCEPTION, err);
  }
};


/**
 * Creates a new XHR object.
 * @return {XMLHttpRequest|GearsHttpRequest} The newly created XHR object.
 * @protected
 */
goog.net.XhrIo.prototype.createXhr = function() {
  return this.xmlHttpFactory_ ?
      this.xmlHttpFactory_.createInstance() : goog.net.XmlHttp();
};


/**
 * The request didn't complete after {@link goog.net.XhrIo#timeoutInterval_}
 * milliseconds; raises a {@link goog.net.EventType.TIMEOUT} event and aborts
 * the request.
 * @private
 */
goog.net.XhrIo.prototype.timeout_ = function() {
  if (typeof goog == 'undefined') {
    // If goog is undefined then the callback has occurred as the application
    // is unloading and will error.  Thus we let it silently fail.
  } else if (this.xhr_) {
    this.lastError_ = 'Timed out after ' + this.timeoutInterval_ +
                      'ms, aborting';
    this.lastErrorCode_ = goog.net.ErrorCode.TIMEOUT;
    this.logger_.fine(this.formatMsg_(this.lastError_));
    this.dispatchEvent(goog.net.EventType.TIMEOUT);
    this.abort(goog.net.ErrorCode.TIMEOUT);
  }
};


/**
 * Something errorred, so inactivate, fire error callback and clean up
 * @param {goog.net.ErrorCode} errorCode The error code.
 * @param {Error} err The error object.
 * @private
 */
goog.net.XhrIo.prototype.error_ = function(errorCode, err) {
  this.active_ = false;
  if (this.xhr_) {
    this.inAbort_ = true;
    this.xhr_.abort();  // Ensures XHR isn't hung (FF)
    this.inAbort_ = false;
  }
  this.lastError_ = err;
  this.lastErrorCode_ = errorCode;
  this.dispatchErrors_();
  this.cleanUpXhr_();
};


/**
 * Dispatches COMPLETE and ERROR in case of an error. This ensures that we do
 * not dispatch multiple error events.
 * @private
 */
goog.net.XhrIo.prototype.dispatchErrors_ = function() {
  if (!this.errorDispatched_) {
    this.errorDispatched_ = true;
    this.dispatchEvent(goog.net.EventType.COMPLETE);
    this.dispatchEvent(goog.net.EventType.ERROR);
  }
};


/**
 * Abort the current XMLHttpRequest
 * @param {goog.net.ErrorCode=} opt_failureCode Optional error code to use -
 *     defaults to ABORT.
 */
goog.net.XhrIo.prototype.abort = function(opt_failureCode) {
  if (this.xhr_ && this.active_) {
    this.logger_.fine(this.formatMsg_('Aborting'));
    this.active_ = false;
    this.inAbort_ = true;
    this.xhr_.abort();
    this.inAbort_ = false;
    this.lastErrorCode_ = opt_failureCode || goog.net.ErrorCode.ABORT;
    this.dispatchEvent(goog.net.EventType.COMPLETE);
    this.dispatchEvent(goog.net.EventType.ABORT);
    this.cleanUpXhr_();
  }
};


/**
 * Nullifies all callbacks to reduce risks of leaks.
 * @override
 * @protected
 */
goog.net.XhrIo.prototype.disposeInternal = function() {
  if (this.xhr_) {
    // We explicitly do not call xhr_.abort() unless active_ is still true.
    // This is to avoid unnecessarily aborting a successful request when
    // dispose() is called in a callback triggered by a complete response, but
    // in which browser cleanup has not yet finished.
    // (See http://b/issue?id=1684217.)
    if (this.active_) {
      this.active_ = false;
      this.inAbort_ = true;
      this.xhr_.abort();
      this.inAbort_ = false;
    }
    this.cleanUpXhr_(true);
  }

  goog.net.XhrIo.superClass_.disposeInternal.call(this);
};


/**
 * Internal handler for the XHR object's readystatechange event.  This method
 * checks the status and the readystate and fires the correct callbacks.
 * If the request has ended, the handlers are cleaned up and the XHR object is
 * nullified.
 * @private
 */
goog.net.XhrIo.prototype.onReadyStateChange_ = function() {
  if (!this.inOpen_ && !this.inSend_ && !this.inAbort_) {
    // Were not being called from within a call to this.xhr_.send
    // this.xhr_.abort, or this.xhr_.open, so this is an entry point
    this.onReadyStateChangeEntryPoint_();
  } else {
    this.onReadyStateChangeHelper_();
  }
};


/**
 * Used to protect the onreadystatechange handler entry point.  Necessary
 * as {#onReadyStateChange_} maybe called from within send or abort, this
 * method is only called when {#onReadyStateChange_} is called as an
 * entry point.
 * {@see #protectEntryPoints}
 * @private
 */
goog.net.XhrIo.prototype.onReadyStateChangeEntryPoint_ = function() {
  this.onReadyStateChangeHelper_();
};


/**
 * Helper for {@link #onReadyStateChange_}.  This is used so that
 * entry point calls to {@link #onReadyStateChange_} can be routed through
 * {@link #onReadyStateChangeEntryPoint_}.
 * @private
 */
goog.net.XhrIo.prototype.onReadyStateChangeHelper_ = function() {
  if (!this.active_) {
    // can get called inside abort call
    return;
  }

  if (typeof goog == 'undefined') {
    // NOTE(user): If goog is undefined then the callback has occurred as the
    // application is unloading and will error.  Thus we let it silently fail.

  } else if (
      this.xhrOptions_[goog.net.XmlHttp.OptionType.LOCAL_REQUEST_ERROR] &&
      this.getReadyState() == goog.net.XmlHttp.ReadyState.COMPLETE &&
      this.getStatus() == 2) {
    // NOTE(user): In IE if send() errors on a *local* request the readystate
    // is still changed to COMPLETE.  We need to ignore it and allow the
    // try/catch around send() to pick up the error.
    this.logger_.fine(this.formatMsg_(
        'Local request error detected and ignored'));

  } else {

    // In IE when the response has been cached we sometimes get the callback
    // from inside the send call and this usually breaks code that assumes that
    // XhrIo is asynchronous.  If that is the case we delay the callback
    // using a timer.
    if (this.inSend_ &&
        this.getReadyState() == goog.net.XmlHttp.ReadyState.COMPLETE) {
      goog.Timer.defaultTimerObject.setTimeout(
          goog.bind(this.onReadyStateChange_, this), 0);
      return;
    }

    this.dispatchEvent(goog.net.EventType.READY_STATE_CHANGE);

    // readyState indicates the transfer has finished
    if (this.isComplete()) {
      this.logger_.fine(this.formatMsg_('Request complete'));

      this.active_ = false;

      // Call the specific callbacks for success or failure. Only call the
      // success if the status is 200 (HTTP_OK) or 304 (HTTP_CACHED)
      if (this.isSuccess()) {
        this.dispatchEvent(goog.net.EventType.COMPLETE);
        this.dispatchEvent(goog.net.EventType.SUCCESS);
      } else {
        this.lastErrorCode_ = goog.net.ErrorCode.HTTP_ERROR;
        this.lastError_ = this.getStatusText() + ' [' + this.getStatus() + ']';
        this.dispatchErrors_();
      }

      this.cleanUpXhr_();
    }
  }
};


/**
 * Remove the listener to protect against leaks, and nullify the XMLHttpRequest
 * object.
 * @param {boolean=} opt_fromDispose If this is from the dispose (don't want to
 *     fire any events).
 * @private
 */
goog.net.XhrIo.prototype.cleanUpXhr_ = function(opt_fromDispose) {
  if (this.xhr_) {
    // Save reference so we can mark it as closed after the READY event.  The
    // READY event may trigger another request, thus we must nullify this.xhr_
    var xhr = this.xhr_;
    var clearedOnReadyStateChange =
        this.xhrOptions_[goog.net.XmlHttp.OptionType.USE_NULL_FUNCTION] ?
            goog.nullFunction : null;
    this.xhr_ = null;
    this.xhrOptions_ = null;

    if (this.timeoutId_) {
      // Cancel any pending timeout event handler.
      goog.Timer.defaultTimerObject.clearTimeout(this.timeoutId_);
      this.timeoutId_ = null;
    }

    if (!opt_fromDispose) {
      this.dispatchEvent(goog.net.EventType.READY);
    }

    try {
      // NOTE(user): Not nullifying in FireFox can still leak if the callbacks
      // are defined in the same scope as the instance of XhrIo. But, IE doesn't
      // allow you to set the onreadystatechange to NULL so nullFunction is
      // used.
      xhr.onreadystatechange = clearedOnReadyStateChange;
    } catch (e) {
      // This seems to occur with a Gears HTTP request. Delayed the setting of
      // this onreadystatechange until after READY is sent out and catching the
      // error to see if we can track down the problem.
      this.logger_.severe('Problem encountered resetting onreadystatechange: ' +
                          e.message);
    }
  }
};


/**
 * @return {boolean} Whether there is an active request.
 */
goog.net.XhrIo.prototype.isActive = function() {
  return !!this.xhr_;
};


/**
 * @return {boolean} Whether the request has completed.
 */
goog.net.XhrIo.prototype.isComplete = function() {
  return this.getReadyState() == goog.net.XmlHttp.ReadyState.COMPLETE;
};


/**
 * @return {boolean} Whether the request completed with a success.
 */
goog.net.XhrIo.prototype.isSuccess = function() {
  var status = this.getStatus();
  // A zero status code is considered successful for local files.
  return goog.net.HttpStatus.isSuccess(status) ||
      status === 0 && !this.isLastUriEffectiveSchemeHttp_();
};


/**
 * @return {boolean} whether the effective scheme of the last URI that was
 *     fetched was 'http' or 'https'.
 * @private
 */
goog.net.XhrIo.prototype.isLastUriEffectiveSchemeHttp_ = function() {
  var scheme = goog.uri.utils.getEffectiveScheme(String(this.lastUri_));
  return goog.net.XhrIo.HTTP_SCHEME_PATTERN.test(scheme);
};


/**
 * Get the readystate from the Xhr object
 * Will only return correct result when called from the context of a callback
 * @return {goog.net.XmlHttp.ReadyState} goog.net.XmlHttp.ReadyState.*.
 */
goog.net.XhrIo.prototype.getReadyState = function() {
  return this.xhr_ ?
      /** @type {goog.net.XmlHttp.ReadyState} */ (this.xhr_.readyState) :
      goog.net.XmlHttp.ReadyState.UNINITIALIZED;
};


/**
 * Get the status from the Xhr object
 * Will only return correct result when called from the context of a callback
 * @return {number} Http status.
 */
goog.net.XhrIo.prototype.getStatus = function() {
  /**
   * IE doesn't like you checking status until the readystate is greater than 2
   * (i.e. it is recieving or complete).  The try/catch is used for when the
   * page is unloading and an ERROR_NOT_AVAILABLE may occur when accessing xhr_.
   * @preserveTry
   */
  try {
    return this.getReadyState() > goog.net.XmlHttp.ReadyState.LOADED ?
        this.xhr_.status : -1;
  } catch (e) {
    this.logger_.warning('Can not get status: ' + e.message);
    return -1;
  }
};


/**
 * Get the status text from the Xhr object
 * Will only return correct result when called from the context of a callback
 * @return {string} Status text.
 */
goog.net.XhrIo.prototype.getStatusText = function() {
  /**
   * IE doesn't like you checking status until the readystate is greater than 2
   * (i.e. it is recieving or complete).  The try/catch is used for when the
   * page is unloading and an ERROR_NOT_AVAILABLE may occur when accessing xhr_.
   * @preserveTry
   */
  try {
    return this.getReadyState() > goog.net.XmlHttp.ReadyState.LOADED ?
        this.xhr_.statusText : '';
  } catch (e) {
    this.logger_.fine('Can not get status: ' + e.message);
    return '';
  }
};


/**
 * Get the last Uri that was requested
 * @return {string} Last Uri.
 */
goog.net.XhrIo.prototype.getLastUri = function() {
  return String(this.lastUri_);
};


/**
 * Get the response text from the Xhr object
 * Will only return correct result when called from the context of a callback.
 * @return {string} Result from the server, or '' if no result available.
 */
goog.net.XhrIo.prototype.getResponseText = function() {
  /** @preserveTry */
  try {
    return this.xhr_ ? this.xhr_.responseText : '';
  } catch (e) {
    // http://www.w3.org/TR/XMLHttpRequest/#the-responsetext-attribute
    // states that responseText should return '' (and responseXML null)
    // when the state is not LOADING or DONE. Instead, IE and Gears can
    // throw unexpected exceptions, eg, when a request is aborted or no
    // data is available yet.
    this.logger_.fine('Can not get responseText: ' + e.message);
    return '';
  }
};


/**
 * Get the response XML from the Xhr object
 * Will only return correct result when called from the context of a callback.
 * @return {Document} The DOM Document representing the XML file, or null
 * if no result available.
 */
goog.net.XhrIo.prototype.getResponseXml = function() {
  /** @preserveTry */
  try {
    return this.xhr_ ? this.xhr_.responseXML : null;
  } catch (e) {
    this.logger_.fine('Can not get responseXML: ' + e.message);
    return null;
  }
};


/**
 * Get the response and evaluates it as JSON from the Xhr object
 * Will only return correct result when called from the context of a callback
 * @param {string=} opt_xssiPrefix Optional XSSI prefix string to use for
 *     stripping of the response before parsing. This needs to be set only if
 *     your backend server prepends the same prefix string to the JSON response.
 * @return {Object|undefined} JavaScript object.
 */
goog.net.XhrIo.prototype.getResponseJson = function(opt_xssiPrefix) {
  if (!this.xhr_) {
    return undefined;
  }

  var responseText = this.xhr_.responseText;
  if (opt_xssiPrefix && responseText.indexOf(opt_xssiPrefix) == 0) {
    responseText = responseText.substring(opt_xssiPrefix.length);
  }

  return goog.json.parse(responseText);
};


/**
 * Get the response as the type specificed by {@link #setResponseType}. At time
 * of writing, this is only directly supported in very recent versions of WebKit
 * (10.0.612.1 dev and later). If the field is not supported directly, we will
 * try to emulate it.
 *
 * Emulating the response means following the rules laid out at
 * http://www.w3.org/TR/XMLHttpRequest/#the-response-attribute
 *
 * On browsers with no support for this (Chrome < 10, Firefox < 4, etc), only
 * response types of DEFAULT or TEXT may be used, and the response returned will
 * be the text response.
 *
 * On browsers with Mozilla's draft support for array buffers (Firefox 4, 5),
 * only response types of DEFAULT, TEXT, and ARRAY_BUFFER may be used, and the
 * response returned will be either the text response or the Mozilla
 * implementation of the array buffer response.
 *
 * On browsers will full support, any valid response type supported by the
 * browser may be used, and the response provided by the browser will be
 * returned.
 *
 * @return {*} The response.
 */
goog.net.XhrIo.prototype.getResponse = function() {
  /** @preserveTry */
  try {
    if (!this.xhr_) {
      return null;
    }
    if ('response' in this.xhr_) {
      return this.xhr_.response;
    }
    switch (this.responseType_) {
      case goog.net.XhrIo.ResponseType.DEFAULT:
      case goog.net.XhrIo.ResponseType.TEXT:
        return this.xhr_.responseText;
        // DOCUMENT and BLOB don't need to be handled here because they are
        // introduced in the same spec that adds the .response field, and would
        // have been caught above.
        // ARRAY_BUFFER needs an implementation for Firefox 4, where it was
        // implemented using a draft spec rather than the final spec.
      case goog.net.XhrIo.ResponseType.ARRAY_BUFFER:
        if ('mozResponseArrayBuffer' in this.xhr_) {
          return this.xhr_.mozResponseArrayBuffer;
        }
    }
    // Fell through to a response type that is not supported on this browser.
    this.logger_.severe('Response type ' + this.responseType_ + ' is not ' +
                        'supported on this browser');
    return null;
  } catch (e) {
    this.logger_.fine('Can not get response: ' + e.message);
    return null;
  }
};


/**
 * Get the value of the response-header with the given name from the Xhr object
 * Will only return correct result when called from the context of a callback
 * and the request has completed
 * @param {string} key The name of the response-header to retrieve.
 * @return {string|undefined} The value of the response-header named key.
 */
goog.net.XhrIo.prototype.getResponseHeader = function(key) {
  return this.xhr_ && this.isComplete() ?
      this.xhr_.getResponseHeader(key) : undefined;
};


/**
 * Gets the text of all the headers in the response.
 * Will only return correct result when called from the context of a callback
 * and the request has completed.
 * @return {string} The value of the response headers or empty string.
 */
goog.net.XhrIo.prototype.getAllResponseHeaders = function() {
  return this.xhr_ && this.isComplete() ?
      this.xhr_.getAllResponseHeaders() : '';
};


/**
 * Get the last error message
 * @return {goog.net.ErrorCode} Last error code.
 */
goog.net.XhrIo.prototype.getLastErrorCode = function() {
  return this.lastErrorCode_;
};


/**
 * Get the last error message
 * @return {string} Last error message.
 */
goog.net.XhrIo.prototype.getLastError = function() {
  return goog.isString(this.lastError_) ? this.lastError_ :
      String(this.lastError_);
};


/**
 * Adds the last method, status and URI to the message.  This is used to add
 * this information to the logging calls.
 * @param {string} msg The message text that we want to add the extra text to.
 * @return {string} The message with the extra text appended.
 * @private
 */
goog.net.XhrIo.prototype.formatMsg_ = function(msg) {
  return msg + ' [' + this.lastMethod_ + ' ' + this.lastUri_ + ' ' +
      this.getStatus() + ']';
};


// Register the xhr handler as an entry point, so that
// it can be monitored for exception handling, etc.
goog.debug.entryPointRegistry.register(
    /**
     * @param {function(!Function): !Function} transformer The transforming
     *     function.
     */
    function(transformer) {
      goog.net.XhrIo.prototype.onReadyStateChangeEntryPoint_ =
          transformer(goog.net.XhrIo.prototype.onReadyStateChangeEntryPoint_);
    });
/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 10.03.12
 * Time: 11:14
 * To change this template use File | Settings | File Templates.
 */

goog.require('goog.net.XhrIo');

goog.provide("Rendering.Import.Element_Array");
/**
 *
 * @constructor
 */
Rendering.Import.Element_Array = function() {
    /**
     *
     * @param verticesFile
     * @param facesFile
     * @param callback
     */
    this.load = function(verticesFile, facesFile, callback) {
        var oneCompleted = false;

        var verticesText, facesText;
        var parse = function() {
            var verticesLines = verticesText.split("\n");
            console.log("vertices count: ", verticesLines.length);
            var _vertices = new Float32Array(verticesLines.length*3);

            var hasNormals = (verticesLines[0].split(" ").length > 3);
            var hasUVs = (verticesLines[0].split(" ").length > 6);

            if(hasNormals) {
                var _normals = new Float32Array(verticesLines.length*3);
            } // 3-element vector for every 3 points for one triangle
            if(hasUVs) {
                var _uvs = new Float32Array(verticesLines.length*2);
            } // 2-coords for every 3 points for one triangle

            for(var i = 0; i < verticesLines.length; i++) {
                var parts = verticesLines[i].split(" ");
                _vertices[i*3 + 0] = parts[0];
                _vertices[i*3 + 1] = parts[1];
                _vertices[i*3 + 2] = parts[2];
                if(hasNormals) {
                    _normals[i*3 + 0] = parts[3];
                    _normals[i*3 + 1] = parts[4];
                    _normals[i*3 + 2] = parts[5];
                }
                if(hasUVs) {
                    _uvs[i*2 + 0] = parts[6];
                    _uvs[i*2 + 1] = parts[7];
                }
            }

            var facesLines = facesText.split("\n");
            console.log("triangles count: ", facesLines.length);
            var vertices = new Float32Array(facesLines.length*3*3); // 3-coords for every 3 points for one triangle
            var normals = new Float32Array(facesLines.length*3*3); // 3-element vector for every 3 points for one triangle
            var uvs = new Float32Array(facesLines.length*2*3); // 2-coords for every 3 points for one triangle

            for(i = 0; i < facesLines.length; i++) {
                parts = facesLines[i].split(" ");
                vertices[i*9 + 0] = _vertices[parts[1]*3 + 0];
                vertices[i*9 + 1] = _vertices[parts[1]*3 + 1];
                vertices[i*9 + 2] = _vertices[parts[1]*3 + 2];

                vertices[i*9 + 3] = _vertices[parts[2]*3 + 0];
                vertices[i*9 + 4] = _vertices[parts[2]*3 + 1];
                vertices[i*9 + 5] = _vertices[parts[2]*3 + 2];

                vertices[i*9 + 6] = _vertices[parts[3]*3 + 0];
                vertices[i*9 + 7] = _vertices[parts[3]*3 + 1];
                vertices[i*9 + 8] = _vertices[parts[3]*3 + 2];
                if(hasNormals) {
                    normals[i*9 + 0] = _normals[parts[1]*3 + 0];
                    normals[i*9 + 1] = _normals[parts[1]*3 + 1];
                    normals[i*9 + 2] = _normals[parts[1]*3 + 2];

                    normals[i*9 + 3] = _normals[parts[2]*3 + 0];
                    normals[i*9 + 4] = _normals[parts[2]*3 + 1];
                    normals[i*9 + 5] = _normals[parts[2]*3 + 2];

                    normals[i*9 + 6] = _normals[parts[3]*3 + 0];
                    normals[i*9 + 7] = _normals[parts[3]*3 + 1];
                    normals[i*9 + 8] = _normals[parts[3]*3 + 2];
                }
                if(hasUVs) {
                    uvs[i*6 + 0] = _uvs[parts[1]*2 + 0];
                    uvs[i*6 + 1] = _uvs[parts[1]*2 + 1];

                    uvs[i*6 + 2] = _uvs[parts[2]*2 + 0];
                    uvs[i*6 + 3] = _uvs[parts[2]*2 + 1];

                    uvs[i*6 + 4] = _uvs[parts[3]*2 + 0];
                    uvs[i*6 + 5] = _uvs[parts[3]*2 + 1];
                }
            }
            callback(vertices, normals, uvs);
        };

        var xhrFile = new goog.net.XhrIo();
        goog.events.listen(xhrFile, goog.net.EventType.COMPLETE, function() {
            verticesText = this.getResponseText();

            if(oneCompleted) parse();
            else oneCompleted = true;
        });
        xhrFile.send(verticesFile);

        var xhrFaces = new goog.net.XhrIo();
        goog.events.listen(xhrFaces, goog.net.EventType.COMPLETE, function() {
            facesText = this.getResponseText();

            if(oneCompleted) parse();
            else oneCompleted = true;
        });
        xhrFaces.send(facesFile);

    };
};/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 09.03.12
 * Time: 23:01
 * To change this template use File | Settings | File Templates.
 */

goog.provide("Rendering.Demos_Demo11");
goog.require('Rendering.Demos_Interface');
goog.require("Rendering.Import.Element_Array");
goog.require("Rendering.Programs_Normal2ColorCameraPosition");
goog.require('Rendering.Model');


/**
 * @constructor
 * @implements {Rendering.Demos_Interface}
 * @param {WebGLRenderingContext}
    */
Rendering.Demos_Demo11 = function(gl) {
    /*
     * @type {Rendering.Programs_Interface}
     */
    this.program = new Rendering.Programs_Normal2ColorCameraPosition(gl);

    /*
     * @type {Rendering.Model?}
     */
    this.model = null;

    /**
     *
     * @type {Rendering.Camera}
     */
    this.camera = new Rendering.Camera();
    this.camera.bindPositionToKeyboard();

    /**
     * @type {mat4}
     */
    this.modelView = mat4.create();
    mat4.identity(this.modelView);
};


Rendering.Demos_Demo11.prototype.title = "Dragon 25 instances";
/**
 * @param {WebGLRenderingContext}
    */
Rendering.Demos_Demo11.prototype.run = function(gl) {
    console.log("run demo 11");

    /**
     * @const
     * @type {number}
     */
    this.numberOfInstances = 25;

    /**
     * @type {Number}
     */
    this.frameNo = 0;

    /**
     * @type {Array.<Rendering.Model_Cube>}
     */
    this.models = [];

    var that = this;
    /**
     *
     * @type {Boolean}
     */
    this.loaded = false;
    var parser = new Rendering.Import.Element_Array();
    parser.load('assets/dragon/dragon_vertices.dat',
        'assets/dragon/dragon_faces.dat',
        function(vertices, normals, uvs) {
            that.model = new Rendering.Model();
            that.model.createVerticesBuffer(gl, vertices);
            if(normals) that.model.createNormalsBuffer(gl, normals);
            if(uvs) that.model.createUVsBuffer(gl, uvs);

            for(var i = 0; i < that.numberOfInstances; i++) {
                that.models[i] = new Rendering.Model(gl);
                that.models[i].createInstance(that.model);
                that.models[i].position = vec3.create([2*Math.random()-1,2*Math.random()-1,2*Math.random()-1]);
            }
            that.loaded = true;
        }
    );

    gl.useProgram(this.program.program);
};

Rendering.Demos_Demo11.prototype.stop = function() {
    console.log("stop demo 11");

    delete this.models;
    delete this.modelView;
    delete this.program;
};
/**
 * @param {WebGLRenderingContext}
    */
Rendering.Demos_Demo11.prototype.frame = function(gl) {
    if(!this.loaded) {
        return;
    }
    this.frameNo++;

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniformMatrix4fv(this.program.uniforms.projectionMatrix, false, this.camera.projection);
    gl.uniformMatrix4fv(this.program.uniforms.viewMatrix, false, this.camera.view);

    mat4.rotate(this.modelView, 1.0/180*Math.PI, [0, 0, 1]);
    mat4.rotate(this.modelView, 0.5/180*Math.PI, [0, 1, 0]);
    mat4.rotate(this.modelView, 0.75/180*Math.PI, [1, 0, 0]);

    /**
     * @type {mat4}
     */
    var instanceMV = mat4.identity();

    for(var i = 0; i < this.numberOfInstances; i++) {
        this.models[i].position[0] = Math.sin(Math.PI/180 * (i%1000) * this.frameNo / 20);
        this.models[i].position[1] = Math.cos(Math.PI/180 * (i%1000) * this.frameNo / 20);

        mat4.translate(this.modelView, this.models[i].position, instanceMV);
        mat4.scale(instanceMV, [0.01,0.01,0.01]);
        gl.uniformMatrix4fv(this.program.uniforms.modelMatrix, false, instanceMV);
        this.program.draw(gl, this.models[i]);
    }
    gl.flush();
};/**
 * Created with JetBrains PhpStorm.
 * User: fridek
 * Date: 04.04.12
 * Time: 22:30
 * To change this template use File | Settings | File Templates.
 */

goog.require("Rendering.Model");

goog.provide("Rendering.Model_Cube");

/**
 *
 * @constructor
 */
Rendering.Model_Cube = function(gl, x) {
    Rendering.Model.call(this);
    /**
     * @type {number}
     */
    this.verticesType = goog.webgl.TRIANGLE_STRIP;

    /**
     * @type {number}
     */
    this.verticesIndexingType = goog.webgl.ARRAY_BUFFER;

    /**
     * @type {Float32Array}
     */
    var vertices = new Float32Array([
        -x, x, -x, // 1
        -x, -x, -x, // 2
        x, x, -x, // 3
        x, -x, -x, // 4
        x, -x, x, // 5
        -x, -x, -x, // 2
        -x, -x, x, // 7
        -x, x, -x, // 1
        -x, x, x, // 9
        x, x, -x, // 3
        x, x, x, // 11
        x, -x, x, // 5
        -x, x, x, // 9
        -x, -x, x // 7
    ]);

    /**
     * @type {WebGLBuffer}
     */
    this.verticesBuffer = gl.createBuffer();

    /**
     * @type {Number}
     */
    this.verticesBufferSize = vertices.length/3;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

/*    var normals = new Float32Array([
        1, 1, 0,
        1, 1, 0,
        1, 0, 0,
        1, 0, 1,
        1, 0, 1,
        0, 1, 1,
        0, 1, 1,
        0, 1, 0,
        0, 1, 0,
        1, 0, 0,
        0, 0, 1,
        0, 0, 1,
        1, 1, 1,
        1, 1, 1
    ]);*/

    /**
     * @type {Float32Array}
     */
    var normals = new Float32Array([
        0, 1, 0, // 1 (-1,0,0)
        0, 1, 0, // 2
        1, 0, 0, // 3
        1, 0, 0, // 4
        1, 0, 0, // 5
        0, 1, 0, // 2
        0, 1, 0, // 7
        0, 1, 0, // 1
        0, 1, 0, // 9
        1, 0, 0, // 3
        1, 0, 0, // 11
        1, 0, 0, // 5
        0, 1, 0, // 9
        0, 1, 0 // 7
    ]);

    /**
     * @type {WebGLBuffer}
     */
    this.normalsBuffer = gl.createBuffer();
    /**
     * @type {Number}
     */
    this.normalsBufferSize = normals.length/3;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
};
goog.inherits(Rendering.Model_Cube,Rendering.Model);
/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 09.03.12
 * Time: 23:01
 * To change this template use File | Settings | File Templates.
 */

goog.provide("Rendering.Demos_Demo10");
goog.require('Rendering.Demos_Interface');
goog.require("Rendering.Import.Element_Array");
goog.require("Rendering.Programs_Normal2ColorCameraPosition");
goog.require('Rendering.Model_Cube');


/**
 * @constructor
 * @implements {Rendering.Demos_Interface}
 * @param {WebGLRenderingContext}
    */
Rendering.Demos_Demo10 = function(gl) {
    /*
     * @type {Rendering.Programs_Interface}
     */
    this.program = new Rendering.Programs_Normal2ColorCameraPosition(gl);

    /*
     * @type {Rendering.Model_Cube?}
     */
    this.model = null;

    /**
     *
     * @type {Rendering.Camera}
     */
    this.camera = new Rendering.Camera();
    this.camera.bindPositionToKeyboard();

    /**
     * @type {mat4}
     */
    this.modelView = mat4.create();
    mat4.identity(this.modelView);
};


Rendering.Demos_Demo10.prototype.title = "Cube primitive 10000 instances";
/**
 * @param {WebGLRenderingContext}
    */
Rendering.Demos_Demo10.prototype.run = function(gl) {
    console.log("run demo 10");

    /**
     * @const
     * @type {number}
     */
    this.numberOfCubes = 10000;

    /**
     * @type {Number}
     */
    this.frameNo = 0;

    /**
     * @type {mat4}
     */
    this.instanceMV = mat4.identity();
    /**
     * @type {Number}
     */
    this.tmp1 = 0;
    /**
     * @type {Number}
     */
    this.tmp2 = 0;
    /**
     * @type {Number}
     */
    this.i = 0;

    /**
     * @type {Array.<Rendering.Model_Cube>}
     */
    this.models = [];
    for(var i = 0; i < this.numberOfCubes; i++) {
        this.models[i] = new Rendering.Model_Cube(gl, 0.01);
        this.models[i].position = vec3.create([2*Math.random()-1,2*Math.random()-1,2*Math.random()-1]);
    }

    gl.useProgram(this.program.program);
};

Rendering.Demos_Demo10.prototype.stop = function() {
    console.log("stop demo 10");

    delete this.models;
    delete this.modelView;
    delete this.program;
};
/**
 * @param {WebGLRenderingContext}
    */
Rendering.Demos_Demo10.prototype.frame = function(gl) {
    this.frameNo++;

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniformMatrix4fv(this.program.uniforms.projectionMatrix, false, this.camera.projection);
    gl.uniformMatrix4fv(this.program.uniforms.viewMatrix, false, this.camera.view);

    mat4.rotate(this.modelView, 1.0/180*Math.PI, [0, 0, 1]);
    mat4.rotate(this.modelView, 0.5/180*Math.PI, [0, 1, 0]);
    mat4.rotate(this.modelView, 0.75/180*Math.PI, [1, 0, 0]);

    mat4.identity(this.instanceMV);

    this.tmp1 = Math.PI/180 * this.frameNo / 20;

    for(this.i = 0; this.i < this.numberOfCubes; this.i++) {
        this.tmp2 = this.tmp1 * this.i%1000;
        this.models[this.i].position[0] = Math.sin(this.tmp2);
        this.models[this.i].position[1] = Math.cos(this.tmp2);

        mat4.translate(this.modelView, this.models[this.i].position, this.instanceMV);
        gl.uniformMatrix4fv(this.program.uniforms.modelMatrix, false, this.instanceMV);
        if(this.models[this.i]) {
            this.program.draw(gl, this.models[this.i]);
        }
    }
    gl.flush();
};/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 09.03.12
 * Time: 23:01
 * To change this template use File | Settings | File Templates.
 */

goog.provide("Rendering.Demos_Demo13");
goog.require('Rendering.Demos_Interface');
goog.require("Rendering.Import.Element_Array");
goog.require("Rendering.Programs_Normal2ColorCameraPosition");
goog.require('Rendering.Model_Cube');


/**
 * @constructor
 * @implements {Rendering.Demos_Interface}
 * @param {WebGLRenderingContext}
    */
Rendering.Demos_Demo13 = function(gl) {
    /*
     * @type {Rendering.Programs_Interface}
     */
    this.program = new Rendering.Programs_Normal2ColorCameraPosition(gl);

    /*
     * @type {Rendering.Model_Cube?}
     */
    this.model = null;

    /**
     *
     * @type {Rendering.Camera}
     */
    this.camera = new Rendering.Camera();
    this.camera.bindPositionToKeyboard();

    /**
     * @type {mat4}
     */
    this.modelView = mat4.create();
    mat4.identity(this.modelView);
};


Rendering.Demos_Demo13.prototype.title = "Cube primitive 10000 instances - no movement";
/**
 * @param {WebGLRenderingContext}
    */
Rendering.Demos_Demo13.prototype.run = function(gl) {
    console.log("run demo 13");

    /**
     * @const
     * @type {number}
     */
    this.numberOfCubes = 10000;

    /**
     * @type {Number}
     */
    this.frameNo = 0;

    /**
     * @type {mat4}
     */
    this.instanceMV = mat4.identity();

    /**
     * @type {Number}
     */
    this.i = 0;

    /**
     * @type {Array.<Rendering.Model_Cube>}
     */
    this.models = [];
    for(var i = 0; i < this.numberOfCubes; i++) {
        this.models[i] = new Rendering.Model_Cube(gl, 0.01);
        this.models[i].position = vec3.create([2*Math.random()-1,2*Math.random()-1,2*Math.random()-1]);
    }

    gl.useProgram(this.program.program);
};

Rendering.Demos_Demo13.prototype.stop = function() {
    console.log("stop demo 10");

    delete this.models;
    delete this.modelView;
    delete this.program;
};
/**
 * @param {WebGLRenderingContext}
    */
Rendering.Demos_Demo13.prototype.frame = function(gl) {
    this.frameNo++;

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniformMatrix4fv(this.program.uniforms.projectionMatrix, false, this.camera.projection);
    gl.uniformMatrix4fv(this.program.uniforms.viewMatrix, false, this.camera.view);

    mat4.rotate(this.modelView, 1.0/180*Math.PI, [0, 0, 1]);
    mat4.rotate(this.modelView, 0.5/180*Math.PI, [0, 1, 0]);
    mat4.rotate(this.modelView, 0.75/180*Math.PI, [1, 0, 0]);

    mat4.identity(this.instanceMV);

    for(this.i = 0; this.i < this.numberOfCubes; this.i++) {

        mat4.translate(this.modelView, this.models[this.i].position, this.instanceMV);
        gl.uniformMatrix4fv(this.program.uniforms.modelMatrix, false, this.instanceMV);
        if(this.models[this.i]) {
            this.program.draw(gl, this.models[this.i]);
        }
    }
    gl.flush();
};/**
 * Created with JetBrains PhpStorm.
 * User: fridek
 * Date: 29.04.12
 * Time: 22:13
 * To change this template use File | Settings | File Templates.
 */

goog.require("Rendering.Model");

goog.provide("Rendering.Model.Manager");

/**
 *
 * @param {WebGLRenderingContext} gl
 * @constructor
 */
Rendering.Model.Manager = function(gl) {

    this.gl = gl;

    /**
     * Total of stored models
     * @type {Number}
     */
    this.modelCount = 0;

    /**
     *
     * @type {Number}
     */
    this.modelsToLoad = 0;

    /**
     *
     * @type {Boolean}
     */
    this.allLoadsFinished = true;

    /**
     *
     * @type {Object.<Rendering.Model>}
     */
    this.models = {};

    /**
     * @type {Array.<Object<key:string, verticesFile:string, facesFile:string, callback:function> >}
     */
    this.elementArrayToLoad = [];
};


/**
 *
 * @param {string} key
 * @param {Rendering.Model} baseModel
 */
Rendering.Model.Manager.prototype.addModel = function(key, baseModel) {
    this.models[key] = baseModel;
    this.modelCount++;
};

/**
 *
 * @param {string} key
 * @param {string} verticesFile
 * @param {string} facesFile
 * @param {function?} callback
 */
Rendering.Model.Manager.prototype.addElementArrayModel = function(key, verticesFile, facesFile, callback) {
    this.allLoadsFinished = false;
    this.modelsToLoad++;
    this.modelCount++;

    this.elementArrayToLoad.push({
        key:key,
        verticesFile:verticesFile,
        facesFile:facesFile,
        callback:callback
    });
};

/**
 *
 * @param {function?} callback
 */
Rendering.Model.Manager.prototype.loadAll = function(callback) {
    var that = this;

    /**
     * @type {Rendering.Import.Element_Array}
     */
    var parser = new Rendering.Import.Element_Array();

    for(var i = 0; i < this.elementArrayToLoad.length; i++) {
        (function(i) {
            parser.load(that.elementArrayToLoad[i].verticesFile, that.elementArrayToLoad[i].facesFile,
                function(vertices, normals, uvs) {
                    var model = new Rendering.Model();
                    model.createVerticesBuffer(that.gl, vertices);
                    if(normals) model.createNormalsBuffer(that.gl, normals);
                    if(uvs) model.createUVsBuffer(that.gl, uvs);
                    that.models[that.elementArrayToLoad[i].key] = model;

                    that.modelsToLoad--;
                    if(that.modelsToLoad == 0) {
                        that.allLoadsFinished = true;
                        callback();
                    }
                });
        }(i));
    }

};



/**
 * @param {string} key
 * @return {Rendering.Model}
 */
Rendering.Model.Manager.prototype.getModelInstance = function(key) {
    /**
     * @type {Rendering.Model}
     */
    var model = new Rendering.Model(this.gl);
    model.createInstance(this.models[key]);
    return model;
};

/**
 *
 * @param {string} key
 * @param {number} count
 * @return {Array.<Rendering.Model>}
 */
Rendering.Model.Manager.prototype.getModelInstances = function(key, count) {
    var models = [];
    for(var i = 0; i < count; i++) {
        models[i] = new Rendering.Model(this.gl);
        models[i].createInstance(this.models[key]);
    }
    return models;
};/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 09.03.12
 * Time: 23:01
 * To change this template use File | Settings | File Templates.
 */

goog.provide("Rendering.Demos_Demo12");
goog.require("goog.array");

goog.require('Rendering.Demos_Interface');

goog.require("Rendering.Programs_Normal2ColorCameraPosition");
goog.require("Rendering.Model.Manager");

/**
 * @constructor
 * @implements {Rendering.Demos_Interface}
 * @param {WebGLRenderingContext}
    */
Rendering.Demos_Demo12 = function(gl) {
    /*
     * @type {Rendering.Programs_Interface}
     */
    this.program = new Rendering.Programs_Normal2ColorCameraPosition(gl);

    /*
     * @type {Rendering.Model.Manager}
     */
    this.manager = new Rendering.Model.Manager(gl);

    /**
     *
     * @type {Array.<Rendering.Model>}
     */
    this.models = [];

    /**
     *
     * @type {Rendering.Camera}
     */
    this.camera = new Rendering.Camera();
    this.camera.bindPositionToKeyboard();

    /**
     * @type {mat4}
     */
    this.modelView = mat4.create();
    mat4.identity(this.modelView);

    /**
     *
     * @type {Boolean}
     */
    this.loaded = false;
};


Rendering.Demos_Demo12.prototype.title = "Model manager";
/**
 * @param {WebGLRenderingContext}
    */
Rendering.Demos_Demo12.prototype.run = function(gl) {
    console.log("run demo 12");

    /**
     * @const
     * @type {number}
     */
    this.numberOfDragonInstances = 5;

    /**
     * @const
     * @type {number}
     */
    this.numberOfTrexInstances = 5;

    /**
     * @type {Number}
     */
    this.frameNo = 0;

    var that = this;

    this.manager.addElementArrayModel('dragon', 'assets/dragon/dragon_vertices.dat', 'assets/dragon/dragon_faces.dat');
    this.manager.addElementArrayModel('trex', 'assets/tyrannosaurus_rex/tyrannosaurus_rex_vertices.dat', 'assets/tyrannosaurus_rex/tyrannosaurus_rex_faces.dat');

    this.manager.loadAll(function() {
        that.loaded = true;
        that.models = goog.array.concat(
            that.manager.getModelInstances('dragon', that.numberOfDragonInstances),
            that.manager.getModelInstances('trex', that.numberOfTrexInstances)
        );
        for(var i = 0; i < that.models.length; i++) {
            that.models[i].position = vec3.create([2*Math.random()-1,2*Math.random()-1,2*Math.random()-1]);
        }
    });

    gl.useProgram(this.program.program);
};

Rendering.Demos_Demo12.prototype.stop = function() {
    console.log("stop demo 12");

    delete this.models;
    delete this.modelView;
    delete this.manager;
    delete this.program;
};
/**
 * @param {WebGLRenderingContext}
    */
Rendering.Demos_Demo12.prototype.frame = function(gl) {
    if(!this.loaded) {
        return;
    }
    this.frameNo++;

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniformMatrix4fv(this.program.uniforms.projectionMatrix, false, this.camera.projection);
    gl.uniformMatrix4fv(this.program.uniforms.viewMatrix, false, this.camera.view);

    mat4.rotate(this.modelView, 1.0/180*Math.PI, [0, 0, 1]);
    mat4.rotate(this.modelView, 0.5/180*Math.PI, [0, 1, 0]);
    mat4.rotate(this.modelView, 0.75/180*Math.PI, [1, 0, 0]);

    /**
     * @type {mat4}
     */
    var instanceMV = mat4.identity();

    for(var i = 0; i < this.models.length; i++) {
        this.models[i].position[0] = Math.sin(Math.PI/180 * (i%1000) * this.frameNo / 20);
        this.models[i].position[1] = Math.cos(Math.PI/180 * (i%1000) * this.frameNo / 20);

        mat4.translate(this.modelView, this.models[i].position, instanceMV);
        mat4.scale(instanceMV, [0.01,0.01,0.01]);
        gl.uniformMatrix4fv(this.program.uniforms.modelMatrix, false, instanceMV);
        this.program.draw(gl, this.models[i]);
    }
    gl.flush();
};/**
 * Created with JetBrains PhpStorm.
 * User: fridek
 * Date: 07.05.12
 * Time: 18:41
 * To change this template use File | Settings | File Templates.
 */


goog.require("Rendering.Model");

goog.provide("Rendering.Model_Sphere");

/**
 *
 * @constructor
 */
Rendering.Model_Sphere = function(gl, radius, rings, sectors) {
    Rendering.Model.call(this);
    /**
     * @type {number}
     */
    this.verticesType = goog.webgl.TRIANGLES;

    /**
     * @type {number}
     */
    this.verticesIndexingType = goog.webgl.ELEMENT_ARRAY_BUFFER;


    var R = 1./(rings-1);
    var S = 1./(sectors-1);

    /**
     * @type {Float32Array}
     */
    var vertices = new Float32Array(rings * sectors * 3);

    /**
     * @type {Float32Array}
     */
    var normals = new Float32Array(rings * sectors * 3);

    /**
     * @type {Uint16Array}
     */
    var indices = new Uint16Array(rings * sectors * 6);

    /**
     * @type {number}
     */
    var latNumber, longNumber, theta, sinTheta, cosTheta, phi, sinPhi, cosPhi, x, y, z, n = 0, v = 0, i = 0, first, second;

    for (latNumber = 0; latNumber <= rings; latNumber++) {
        theta = latNumber * Math.PI / rings;
        sinTheta = Math.sin(theta);
        cosTheta = Math.cos(theta);

        for (longNumber = 0; longNumber <= sectors; longNumber++) {
            phi = longNumber * 2 * Math.PI / sectors;
            sinPhi = Math.sin(phi);
            cosPhi = Math.cos(phi);

            x = cosPhi * sinTheta;
            y = cosTheta;
            z = sinPhi * sinTheta;

            normals[n++] = x;
            normals[n++] = y;
            normals[n++] = z;

            vertices[v++] = radius * x;
            vertices[v++] = radius * y;
            vertices[v++] = radius * z;
        }
    }

    for (latNumber = 0; latNumber < rings; latNumber++) {
        for (longNumber = 0; longNumber < sectors; longNumber++) {
            first = (latNumber * (sectors + 1)) + longNumber;
            second = first + sectors + 1;
            indices[i++] = first;
            indices[i++] = second;
            indices[i++] = first + 1;

            indices[i++] = second;
            indices[i++] = second + 1;
            indices[i++] = first + 1;
        }
    }



    /**
     * @type {WebGLBuffer}
     */
    this.verticesBuffer = gl.createBuffer();

    /**
     * @type {Number}
     */
    this.verticesBufferSize = vertices.length/3;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    /**
     * @type {WebGLBuffer}
     */
    this.normalsBuffer = gl.createBuffer();
    /**
     * @type {Number}
     */
    this.normalsBufferSize = normals.length/3;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);


    /**
     * @type {WebGLBuffer}
     */
    this.indicesBuffer = gl.createBuffer();

    /**
     * @type {Number}
     */
    this.indicesBufferSize = indices.length;

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
};
goog.inherits(Rendering.Model_Sphere,Rendering.Model);
/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 10.03.12
 * Time: 13:18
 * To change this template use File | Settings | File Templates.
 */

goog.require("Rendering.Programs_Interface");
goog.provide("Rendering.Programs_Normal2Color");

/**
 * @constructor
 * @implements {Rendering.Programs_Interface}
 * @param {WebGLRenderingContext}
 */
Rendering.Programs_Normal2Color = function(gl) {
    var vshader = gl.createShader(goog.webgl.VERTEX_SHADER);
    gl.shaderSource(vshader,[
        'attribute vec3 aVertexPosition;',
        'attribute vec3 normalPosition;',

        'varying mediump vec4 vVaryingColor;',
        'uniform mat4 MVMatrix;',

        'void main(void)',
        '{',
            'vVaryingColor = vec4(normalPosition, 1.0);',
            'gl_Position = MVMatrix * vec4(aVertexPosition, 1.0);',
        '}'].join("\n")
    );
    gl.compileShader(vshader);
    if (!gl.getShaderParameter(vshader, goog.webgl.COMPILE_STATUS)) {
        alert('Error during vertex shader compilation:\n' + gl.getShaderInfoLog(vshader)); return;
    }


    var fshader = gl.createShader(goog.webgl.FRAGMENT_SHADER);
    gl.shaderSource(fshader, [
        'varying mediump vec4 vVaryingColor;',
        'void main(void)',
        '{',
            'gl_FragColor = vVaryingColor;',
        '}'].join("\n"));
    gl.compileShader(fshader);
    if (!gl.getShaderParameter(fshader, goog.webgl.COMPILE_STATUS)) {
        alert('Error during vertex shader compilation:\n' + gl.getShaderInfoLog(fshader)); return;
    }

    var program = gl.createProgram();
    gl.attachShader(program, fshader);
    gl.attachShader(program, vshader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, goog.webgl.LINK_STATUS)){
        alert("Error during program linking:\n" + gl.getProgramInfoLog(program));
        return;
    }

    // Validates and uses program in the GL context
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, goog.webgl.VALIDATE_STATUS)) {
        alert("Error during program validation:\n" + gl.getProgramInfoLog(program));
        return;
    }
    /**
     * @type {WebGLProgram}
     */
    this.program = program;
    /**
     * @type {Object.<WebGLUniformLocation>}
     */
    this.uniforms=  {
            MVMatrix: gl.getUniformLocation(program, "MVMatrix")
        };
    /**
     * @type {Object.<number>}
     */
    this.attribs = {
            vertexPosition: gl.getAttribLocation(program, 'aVertexPosition'),
            normalPosition: gl.getAttribLocation(program, 'normalPosition')
        };
    gl.enableVertexAttribArray(this.attribs.vertexPosition);
    gl.enableVertexAttribArray(this.attribs.normalPosition);
};
/**
 * @param {WebGLRenderingContext}
 * @param {Rendering.Model}
 */
Rendering.Programs_Normal2Color.prototype.draw = function(gl, model) {
    if(model.verticesIndexingType === goog.webgl.ARRAY_BUFFER) {
        gl.bindBuffer(goog.webgl.ARRAY_BUFFER, model.verticesBuffer);
        gl.vertexAttribPointer(this.attribs.vertexPosition, 3, goog.webgl.FLOAT, false, 0, 0);
        gl.bindBuffer(goog.webgl.ARRAY_BUFFER, model.normalsBuffer);

        gl.vertexAttribPointer(this.attribs.normalPosition, 3, goog.webgl.FLOAT, false, 0, 0);
        gl.drawArrays(model.verticesType, 0, model.verticesBufferSize);
    }

    if(model.verticesIndexingType === goog.webgl.ELEMENT_ARRAY_BUFFER) {
        gl.bindBuffer(goog.webgl.ARRAY_BUFFER, model.verticesBuffer);
        gl.vertexAttribPointer(this.attribs.vertexPosition, 3, goog.webgl.FLOAT, false, 0, 0);

        gl.bindBuffer(goog.webgl.ARRAY_BUFFER, model.normalsBuffer);
        gl.vertexAttribPointer(this.attribs.normalPosition, 3, goog.webgl.FLOAT, false, 0, 0);

        gl.bindBuffer(goog.webgl.ELEMENT_ARRAY_BUFFER, model.indicesBuffer);
        gl.drawElements(model.verticesType, model.indicesBufferSize, goog.webgl.UNSIGNED_SHORT, 0);
    }

};/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 09.03.12
 * Time: 23:01
 * To change this template use File | Settings | File Templates.
 */

goog.provide("Rendering.Demos_Demo14");
goog.require('Rendering.Demos_Interface');
goog.require("Rendering.Import.Element_Array");
goog.require("Rendering.Programs_Normal2Color");
goog.require('Rendering.Model_Sphere');


/**
 * @constructor
 * @implements {Rendering.Demos_Interface}
 * @param {WebGLRenderingContext}
    */
Rendering.Demos_Demo14 = function(gl) {
    /*
     * @type {Rendering.Programs_Interface}
     */
    this.program = new Rendering.Programs_Normal2Color(gl);

    /*
     * @type {Rendering.Model_Cube?}
     */
    this.model = null;

    /**
     * @type {mat4}
     */
    this.modelView = mat4.create();
    mat4.identity(this.modelView);
};


Rendering.Demos_Demo14.prototype.title = "Sphere primitive";
/**
 * @param {WebGLRenderingContext}
    */
Rendering.Demos_Demo14.prototype.run = function(gl) {
    console.log("run demo 14");
    this.model = new Rendering.Model_Sphere(gl, 1, 10, 10);

    gl.useProgram(this.program.program);
};

Rendering.Demos_Demo14.prototype.stop = function() {
    console.log("stop demo 14");

    delete this.model;
    delete this.modelView;
    delete this.program;
};
/**
 * @param {WebGLRenderingContext}
    */
Rendering.Demos_Demo14.prototype.frame = function(gl) {
    gl.clear(gl.COLOR_BUFFER_BIT);

    mat4.rotate(this.modelView, 1.0/180*Math.PI, [0, 0, 1]);
    mat4.rotate(this.modelView, 0.5/180*Math.PI, [0, 1, 0]);
    mat4.rotate(this.modelView, 0.75/180*Math.PI, [1, 0, 0]);
    gl.uniformMatrix4fv(this.program.uniforms.MVMatrix, false, this.modelView);

    if(this.model) this.program.draw(gl, this.model);
    gl.flush();
};/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 10.03.12
 * Time: 13:18
 * To change this template use File | Settings | File Templates.
 */
goog.require("Rendering.Programs_Interface");
goog.provide("Rendering.Programs_Light_Texture");

/**
 * @constructor
 * @implements {Rendering.Programs_Interface}
 * @param {WebGLRenderingContext}
*/
Rendering.Programs_Light_Texture = function(gl) {
    var vshader = gl.createShader(goog.webgl.VERTEX_SHADER);
    gl.shaderSource(vshader,[
        'attribute vec3 vertexPosition;',
        'attribute vec3 vertexNormal;',
        'attribute vec2 vertexTextureCoords;',

        'varying mediump vec2 texture_coordinates;',
        'varying mediump vec3 vLighting;',

        'uniform mat4 MVMatrix;',
        'uniform vec3 Light;',

        'void main(void)',
        '{',
            'texture_coordinates = vertexTextureCoords;',
            'gl_Position = MVMatrix * vec4(vertexPosition, 1.0);',

            'highp vec3 ambientLight = vec3(0.6, 0.6, 0.6);',
            'highp vec3 directionalLightColor = vec3(0.5, 0.5, 0.75);',

            'highp float directional = max(dot(vertexNormal, Light), 0.0);',
            'vLighting = ambientLight + (directionalLightColor * directional);',
    '}'].join("\n")
    );
    gl.compileShader(vshader);
    if (!gl.getShaderParameter(vshader, goog.webgl.COMPILE_STATUS)) {
        alert('Error during vertex shader compilation:\n' + gl.getShaderInfoLog(vshader)); return;
    }


    var fshader = gl.createShader(goog.webgl.FRAGMENT_SHADER);
    gl.shaderSource(fshader, [
        'varying highp vec2 texture_coordinates;',
        'varying highp vec3 vLighting;',
        'uniform sampler2D texture_unit;',

        'void main(void)',
        '{',
            'highp vec4 texelColor = texture2D(texture_unit, vec2(texture_coordinates.s, texture_coordinates.t));',
            'gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);',
        '}'].join("\n"));
    gl.compileShader(fshader);
    if (!gl.getShaderParameter(fshader, goog.webgl.COMPILE_STATUS)) {
        alert('Error during vertex shader compilation:\n' + gl.getShaderInfoLog(fshader)); return;
    }

    var program = gl.createProgram();
    gl.attachShader(program, fshader);
    gl.attachShader(program, vshader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, goog.webgl.LINK_STATUS)){
        alert("Error during program linking:\n" + gl.getProgramInfoLog(program));
        return;
    }

    // Validates and uses program in the GL context
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, goog.webgl.VALIDATE_STATUS)) {
        alert("Error during program validation:\n" + gl.getProgramInfoLog(program));
        return;
    }
    /**
     * @type {WebGLProgram}
     */
    this.program = program;
    /**
     * @type {Object.<WebGLUniformLocation>}
     */
    this.uniforms=  {
            MVMatrix: gl.getUniformLocation(program, "MVMatrix"),
            Light: gl.getUniformLocation(program, "Light"),
            texture_unit: gl.getUniformLocation(program, "texture_unit")
        };
    /**
     * @type {Object.<number>}
     */
    this.attribs = {
            vertexPosition: gl.getAttribLocation(program, 'vertexPosition'),
            vertexNormal: gl.getAttribLocation(program, 'vertexNormal'),
            vertexTextureCoords: gl.getAttribLocation(program, 'vertexTextureCoords')
        };
    gl.enableVertexAttribArray(this.attribs.vertexPosition);
    gl.enableVertexAttribArray(this.attribs.vertexNormal);
    gl.enableVertexAttribArray(this.attribs.vertexTextureCoords);
};
/** * @param {WebGLRenderingContext}
 * @param {Rendering.Model}
 */
Rendering.Programs_Light_Texture.prototype.draw = function(gl, model) {
    gl.bindBuffer(goog.webgl.ARRAY_BUFFER, model.verticesBuffer);
    gl.vertexAttribPointer(this.attribs.vertexPosition, 3, goog.webgl.FLOAT, false, 0, 0);
    gl.bindBuffer(goog.webgl.ARRAY_BUFFER, model.normalsBuffer);
    gl.vertexAttribPointer(this.attribs.vertexNormal, 3, goog.webgl.FLOAT, false, 0, 0);
    gl.bindBuffer(goog.webgl.ARRAY_BUFFER, model.uvsBuffer);
    gl.vertexAttribPointer(this.attribs.vertexTextureCoords, 2, goog.webgl.FLOAT, false, 0, 0);

    gl.activeTexture(goog.webgl.TEXTURE0);
    gl.bindTexture(goog.webgl.TEXTURE_2D, model.texture);

    gl.drawArrays(model.verticesType, 0, model.verticesBufferSize);
};// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities for adding, removing and setting classes.
 *
 */


goog.provide('goog.dom.classes');

goog.require('goog.array');


/**
 * Sets the entire class name of an element.
 * @param {Node} element DOM node to set class of.
 * @param {string} className Class name(s) to apply to element.
 */
goog.dom.classes.set = function(element, className) {
  element.className = className;
};


/**
 * Gets an array of class names on an element
 * @param {Node} element DOM node to get class of.
 * @return {!Array} Class names on {@code element}. Some browsers add extra
 *     properties to the array. Do not depend on any of these!
 */
goog.dom.classes.get = function(element) {
  var className = element.className;
  // Some types of elements don't have a className in IE (e.g. iframes).
  // Furthermore, in Firefox, className is not a string when the element is
  // an SVG element.
  return goog.isString(className) && className.match(/\S+/g) || [];
};


/**
 * Adds a class or classes to an element. Does not add multiples of class names.
 * @param {Node} element DOM node to add class to.
 * @param {...string} var_args Class names to add.
 * @return {boolean} Whether class was added (or all classes were added).
 */
goog.dom.classes.add = function(element, var_args) {
  var classes = goog.dom.classes.get(element);
  var args = goog.array.slice(arguments, 1);
  var expectedCount = classes.length + args.length;
  goog.dom.classes.add_(classes, args);
  element.className = classes.join(' ');
  return classes.length == expectedCount;
};


/**
 * Removes a class or classes from an element.
 * @param {Node} element DOM node to remove class from.
 * @param {...string} var_args Class name(s) to remove.
 * @return {boolean} Whether all classes in {@code var_args} were found and
 *     removed.
 */
goog.dom.classes.remove = function(element, var_args) {
  var classes = goog.dom.classes.get(element);
  var args = goog.array.slice(arguments, 1);
  var newClasses = goog.dom.classes.getDifference_(classes, args);
  element.className = newClasses.join(' ');
  return newClasses.length == classes.length - args.length;
};


/**
 * Helper method for {@link goog.dom.classes.add} and
 * {@link goog.dom.classes.addRemove}. Adds one or more classes to the supplied
 * classes array.
 * @param {Array.<string>} classes All class names for the element, will be
 *     updated to have the classes supplied in {@code args} added.
 * @param {Array.<string>} args Class names to add.
 * @private
 */
goog.dom.classes.add_ = function(classes, args) {
  for (var i = 0; i < args.length; i++) {
    if (!goog.array.contains(classes, args[i])) {
      classes.push(args[i]);
    }
  }
};


/**
 * Helper method for {@link goog.dom.classes.remove} and
 * {@link goog.dom.classes.addRemove}. Calculates the difference of two arrays.
 * @param {!Array.<string>} arr1 First array.
 * @param {!Array.<string>} arr2 Second array.
 * @return {!Array.<string>} The first array without the elements of the second
 *     array.
 * @private
 */
goog.dom.classes.getDifference_ = function(arr1, arr2) {
  return goog.array.filter(arr1, function(item) {
    return !goog.array.contains(arr2, item);
  });
};


/**
 * Switches a class on an element from one to another without disturbing other
 * classes. If the fromClass isn't removed, the toClass won't be added.
 * @param {Node} element DOM node to swap classes on.
 * @param {string} fromClass Class to remove.
 * @param {string} toClass Class to add.
 * @return {boolean} Whether classes were switched.
 */
goog.dom.classes.swap = function(element, fromClass, toClass) {
  var classes = goog.dom.classes.get(element);

  var removed = false;
  for (var i = 0; i < classes.length; i++) {
    if (classes[i] == fromClass) {
      goog.array.splice(classes, i--, 1);
      removed = true;
    }
  }

  if (removed) {
    classes.push(toClass);
    element.className = classes.join(' ');
  }

  return removed;
};


/**
 * Adds zero or more classes to an element and removes zero or more as a single
 * operation. Unlike calling {@link goog.dom.classes.add} and
 * {@link goog.dom.classes.remove} separately, this is more efficient as it only
 * parses the class property once.
 *
 * If a class is in both the remove and add lists, it will be added. Thus,
 * you can use this instead of {@link goog.dom.classes.swap} when you have
 * more than two class names that you want to swap.
 *
 * @param {Node} element DOM node to swap classes on.
 * @param {?(string|Array.<string>)} classesToRemove Class or classes to
 *     remove, if null no classes are removed.
 * @param {?(string|Array.<string>)} classesToAdd Class or classes to add, if
 *     null no classes are added.
 */
goog.dom.classes.addRemove = function(element, classesToRemove, classesToAdd) {
  var classes = goog.dom.classes.get(element);
  if (goog.isString(classesToRemove)) {
    goog.array.remove(classes, classesToRemove);
  } else if (goog.isArray(classesToRemove)) {
    classes = goog.dom.classes.getDifference_(classes, classesToRemove);
  }

  if (goog.isString(classesToAdd) &&
      !goog.array.contains(classes, classesToAdd)) {
    classes.push(classesToAdd);
  } else if (goog.isArray(classesToAdd)) {
    goog.dom.classes.add_(classes, classesToAdd);
  }

  element.className = classes.join(' ');
};


/**
 * Returns true if an element has a class.
 * @param {Node} element DOM node to test.
 * @param {string} className Class name to test for.
 * @return {boolean} Whether element has the class.
 */
goog.dom.classes.has = function(element, className) {
  return goog.array.contains(goog.dom.classes.get(element), className);
};


/**
 * Adds or removes a class depending on the enabled argument.
 * @param {Node} element DOM node to add or remove the class on.
 * @param {string} className Class name to add or remove.
 * @param {boolean} enabled Whether to add or remove the class (true adds,
 *     false removes).
 */
goog.dom.classes.enable = function(element, className, enabled) {
  if (enabled) {
    goog.dom.classes.add(element, className);
  } else {
    goog.dom.classes.remove(element, className);
  }
};


/**
 * Removes a class if an element has it, and adds it the element doesn't have
 * it.  Won't affect other classes on the node.
 * @param {Node} element DOM node to toggle class on.
 * @param {string} className Class to toggle.
 * @return {boolean} True if class was added, false if it was removed
 *     (in other words, whether element has the class after this function has
 *     been called).
 */
goog.dom.classes.toggle = function(element, className) {
  var add = !goog.dom.classes.has(element, className);
  goog.dom.classes.enable(element, className, add);
  return add;
};
// Copyright 2007 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Defines the goog.dom.TagName enum.  This enumerates
 * all html tag names specified by the W3C HTML 4.01 Specification.
 * Reference http://www.w3.org/TR/html401/index/elements.html.
 */
goog.provide('goog.dom.TagName');


/**
 * Enum of all html tag names specified by the W3C HTML 4.01 Specification.
 * Reference http://www.w3.org/TR/html401/index/elements.html
 * @enum {string}
 */
goog.dom.TagName = {
  A: 'A',
  ABBR: 'ABBR',
  ACRONYM: 'ACRONYM',
  ADDRESS: 'ADDRESS',
  APPLET: 'APPLET',
  AREA: 'AREA',
  AUDIO: 'AUDIO',
  B: 'B',
  BASE: 'BASE',
  BASEFONT: 'BASEFONT',
  BDO: 'BDO',
  BIG: 'BIG',
  BLOCKQUOTE: 'BLOCKQUOTE',
  BODY: 'BODY',
  BR: 'BR',
  BUTTON: 'BUTTON',
  CANVAS: 'CANVAS',
  CAPTION: 'CAPTION',
  CENTER: 'CENTER',
  CITE: 'CITE',
  CODE: 'CODE',
  COL: 'COL',
  COLGROUP: 'COLGROUP',
  DD: 'DD',
  DEL: 'DEL',
  DFN: 'DFN',
  DIR: 'DIR',
  DIV: 'DIV',
  DL: 'DL',
  DT: 'DT',
  EM: 'EM',
  FIELDSET: 'FIELDSET',
  FONT: 'FONT',
  FORM: 'FORM',
  FRAME: 'FRAME',
  FRAMESET: 'FRAMESET',
  H1: 'H1',
  H2: 'H2',
  H3: 'H3',
  H4: 'H4',
  H5: 'H5',
  H6: 'H6',
  HEAD: 'HEAD',
  HR: 'HR',
  HTML: 'HTML',
  I: 'I',
  IFRAME: 'IFRAME',
  IMG: 'IMG',
  INPUT: 'INPUT',
  INS: 'INS',
  ISINDEX: 'ISINDEX',
  KBD: 'KBD',
  LABEL: 'LABEL',
  LEGEND: 'LEGEND',
  LI: 'LI',
  LINK: 'LINK',
  MAP: 'MAP',
  MENU: 'MENU',
  META: 'META',
  NOFRAMES: 'NOFRAMES',
  NOSCRIPT: 'NOSCRIPT',
  OBJECT: 'OBJECT',
  OL: 'OL',
  OPTGROUP: 'OPTGROUP',
  OPTION: 'OPTION',
  P: 'P',
  PARAM: 'PARAM',
  PRE: 'PRE',
  Q: 'Q',
  S: 'S',
  SAMP: 'SAMP',
  SCRIPT: 'SCRIPT',
  SELECT: 'SELECT',
  SMALL: 'SMALL',
  SPAN: 'SPAN',
  STRIKE: 'STRIKE',
  STRONG: 'STRONG',
  STYLE: 'STYLE',
  SUB: 'SUB',
  SUP: 'SUP',
  TABLE: 'TABLE',
  TBODY: 'TBODY',
  TD: 'TD',
  TEXTAREA: 'TEXTAREA',
  TFOOT: 'TFOOT',
  TH: 'TH',
  THEAD: 'THEAD',
  TITLE: 'TITLE',
  TR: 'TR',
  TT: 'TT',
  U: 'U',
  UL: 'UL',
  VAR: 'VAR',
  VIDEO: 'VIDEO'
};
// Copyright 2007 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview A utility class for representing two-dimensional sizes.
 */


goog.provide('goog.math.Size');



/**
 * Class for representing sizes consisting of a width and height. Undefined
 * width and height support is deprecated and results in compiler warning.
 * @param {number} width Width.
 * @param {number} height Height.
 * @constructor
 */
goog.math.Size = function(width, height) {
  /**
   * Width
   * @type {number}
   */
  this.width = width;

  /**
   * Height
   * @type {number}
   */
  this.height = height;
};


/**
 * Compares sizes for equality.
 * @param {goog.math.Size} a A Size.
 * @param {goog.math.Size} b A Size.
 * @return {boolean} True iff the sizes have equal widths and equal
 *     heights, or if both are null.
 */
goog.math.Size.equals = function(a, b) {
  if (a == b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return a.width == b.width && a.height == b.height;
};


/**
 * @return {!goog.math.Size} A new copy of the Size.
 */
goog.math.Size.prototype.clone = function() {
  return new goog.math.Size(this.width, this.height);
};


if (goog.DEBUG) {
  /**
   * Returns a nice string representing size.
   * @return {string} In the form (50 x 73).
   */
  goog.math.Size.prototype.toString = function() {
    return '(' + this.width + ' x ' + this.height + ')';
  };
}


/**
 * @return {number} The longer of the two dimensions in the size.
 */
goog.math.Size.prototype.getLongest = function() {
  return Math.max(this.width, this.height);
};


/**
 * @return {number} The shorter of the two dimensions in the size.
 */
goog.math.Size.prototype.getShortest = function() {
  return Math.min(this.width, this.height);
};


/**
 * @return {number} The area of the size (width * height).
 */
goog.math.Size.prototype.area = function() {
  return this.width * this.height;
};


/**
 * @return {number} The perimeter of the size (width + height) * 2.
 */
goog.math.Size.prototype.perimeter = function() {
  return (this.width + this.height) * 2;
};


/**
 * @return {number} The ratio of the size's width to its height.
 */
goog.math.Size.prototype.aspectRatio = function() {
  return this.width / this.height;
};


/**
 * @return {boolean} True if the size has zero area, false if both dimensions
 *     are non-zero numbers.
 */
goog.math.Size.prototype.isEmpty = function() {
  return !this.area();
};


/**
 * Clamps the width and height parameters upward to integer values.
 * @return {!goog.math.Size} This size with ceil'd components.
 */
goog.math.Size.prototype.ceil = function() {
  this.width = Math.ceil(this.width);
  this.height = Math.ceil(this.height);
  return this;
};


/**
 * @param {!goog.math.Size} target The target size.
 * @return {boolean} True if this Size is the same size or smaller than the
 *     target size in both dimensions.
 */
goog.math.Size.prototype.fitsInside = function(target) {
  return this.width <= target.width && this.height <= target.height;
};


/**
 * Clamps the width and height parameters downward to integer values.
 * @return {!goog.math.Size} This size with floored components.
 */
goog.math.Size.prototype.floor = function() {
  this.width = Math.floor(this.width);
  this.height = Math.floor(this.height);
  return this;
};


/**
 * Rounds the width and height parameters to integer values.
 * @return {!goog.math.Size} This size with rounded components.
 */
goog.math.Size.prototype.round = function() {
  this.width = Math.round(this.width);
  this.height = Math.round(this.height);
  return this;
};


/**
 * Scales the size uniformly by a factor.
 * @param {number} s The scale factor.
 * @return {!goog.math.Size} This Size object after scaling.
 */
goog.math.Size.prototype.scale = function(s) {
  this.width *= s;
  this.height *= s;
  return this;
};


/**
 * Uniformly scales the size to fit inside the dimensions of a given size. The
 * original aspect ratio will be preserved.
 *
 * This function assumes that both Sizes contain strictly positive dimensions.
 * @param {!goog.math.Size} target The target size.
 * @return {!goog.math.Size} This Size object, after optional scaling.
 */
goog.math.Size.prototype.scaleToFit = function(target) {
  var s = this.aspectRatio() > target.aspectRatio() ?
      target.width / this.width :
      target.height / this.height;

  return this.scale(s);
};
// Copyright 2010 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Browser capability checks for the dom package.
 *
 */


goog.provide('goog.dom.BrowserFeature');

goog.require('goog.userAgent');


/**
 * Enum of browser capabilities.
 * @enum {boolean}
 */
goog.dom.BrowserFeature = {
  /**
   * Whether attributes 'name' and 'type' can be added to an element after it's
   * created. False in Internet Explorer prior to version 9.
   */
  CAN_ADD_NAME_OR_TYPE_ATTRIBUTES: !goog.userAgent.IE ||
      goog.userAgent.isDocumentMode(9),

  /**
   * Whether we can use element.children to access an element's Element
   * children. Available since Gecko 1.9.1, IE 9. (IE<9 also includes comment
   * nodes in the collection.)
   */
  CAN_USE_CHILDREN_ATTRIBUTE: !goog.userAgent.GECKO && !goog.userAgent.IE ||
      goog.userAgent.IE && goog.userAgent.isDocumentMode(9) ||
      goog.userAgent.GECKO && goog.userAgent.isVersion('1.9.1'),

  /**
   * Opera, Safari 3, and Internet Explorer 9 all support innerText but they
   * include text nodes in script and style tags. Not document-mode-dependent.
   */
  CAN_USE_INNER_TEXT: goog.userAgent.IE && !goog.userAgent.isVersion('9'),

  /**
   * MSIE, Opera, and Safari>=4 support element.parentElement to access an
   * element's parent if it is an Element.
   */
  CAN_USE_PARENT_ELEMENT_PROPERTY: goog.userAgent.IE || goog.userAgent.OPERA ||
      goog.userAgent.WEBKIT,

  /**
   * Whether NoScope elements need a scoped element written before them in
   * innerHTML.
   * MSDN: http://msdn.microsoft.com/en-us/library/ms533897(VS.85).aspx#1
   */
  INNER_HTML_NEEDS_SCOPED_ELEMENT: goog.userAgent.IE
};
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview A utility class for representing two-dimensional positions.
 */


goog.provide('goog.math.Coordinate');



/**
 * Class for representing coordinates and positions.
 * @param {number=} opt_x Left, defaults to 0.
 * @param {number=} opt_y Top, defaults to 0.
 * @constructor
 */
goog.math.Coordinate = function(opt_x, opt_y) {
  /**
   * X-value
   * @type {number}
   */
  this.x = goog.isDef(opt_x) ? opt_x : 0;

  /**
   * Y-value
   * @type {number}
   */
  this.y = goog.isDef(opt_y) ? opt_y : 0;
};


/**
 * Returns a new copy of the coordinate.
 * @return {!goog.math.Coordinate} A clone of this coordinate.
 */
goog.math.Coordinate.prototype.clone = function() {
  return new goog.math.Coordinate(this.x, this.y);
};


if (goog.DEBUG) {
  /**
   * Returns a nice string representing the coordinate.
   * @return {string} In the form (50, 73).
   */
  goog.math.Coordinate.prototype.toString = function() {
    return '(' + this.x + ', ' + this.y + ')';
  };
}


/**
 * Compares coordinates for equality.
 * @param {goog.math.Coordinate} a A Coordinate.
 * @param {goog.math.Coordinate} b A Coordinate.
 * @return {boolean} True iff the coordinates are equal, or if both are null.
 */
goog.math.Coordinate.equals = function(a, b) {
  if (a == b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return a.x == b.x && a.y == b.y;
};


/**
 * Returns the distance between two coordinates.
 * @param {!goog.math.Coordinate} a A Coordinate.
 * @param {!goog.math.Coordinate} b A Coordinate.
 * @return {number} The distance between {@code a} and {@code b}.
 */
goog.math.Coordinate.distance = function(a, b) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
};


/**
 * Returns the squared distance between two coordinates. Squared distances can
 * be used for comparisons when the actual value is not required.
 *
 * Performance note: eliminating the square root is an optimization often used
 * in lower-level languages, but the speed difference is not nearly as
 * pronounced in JavaScript (only a few percent.)
 *
 * @param {!goog.math.Coordinate} a A Coordinate.
 * @param {!goog.math.Coordinate} b A Coordinate.
 * @return {number} The squared distance between {@code a} and {@code b}.
 */
goog.math.Coordinate.squaredDistance = function(a, b) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  return dx * dx + dy * dy;
};


/**
 * Returns the difference between two coordinates as a new
 * goog.math.Coordinate.
 * @param {!goog.math.Coordinate} a A Coordinate.
 * @param {!goog.math.Coordinate} b A Coordinate.
 * @return {!goog.math.Coordinate} A Coordinate representing the difference
 *     between {@code a} and {@code b}.
 */
goog.math.Coordinate.difference = function(a, b) {
  return new goog.math.Coordinate(a.x - b.x, a.y - b.y);
};


/**
 * Returns the sum of two coordinates as a new goog.math.Coordinate.
 * @param {!goog.math.Coordinate} a A Coordinate.
 * @param {!goog.math.Coordinate} b A Coordinate.
 * @return {!goog.math.Coordinate} A Coordinate representing the sum of the two
 *     coordinates.
 */
goog.math.Coordinate.sum = function(a, b) {
  return new goog.math.Coordinate(a.x + b.x, a.y + b.y);
};
// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Utilities for manipulating the browser's Document Object Model
 * Inspiration taken *heavily* from mochikit (http://mochikit.com/).
 *
 * You can use {@link goog.dom.DomHelper} to create new dom helpers that refer
 * to a different document object.  This is useful if you are working with
 * frames or multiple windows.
 *
 */


// TODO(arv): Rename/refactor getTextContent and getRawTextContent. The problem
// is that getTextContent should mimic the DOM3 textContent. We should add a
// getInnerText (or getText) which tries to return the visible text, innerText.


goog.provide('goog.dom');
goog.provide('goog.dom.DomHelper');
goog.provide('goog.dom.NodeType');

goog.require('goog.array');
goog.require('goog.dom.BrowserFeature');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classes');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Size');
goog.require('goog.object');
goog.require('goog.string');
goog.require('goog.userAgent');


/**
 * @define {boolean} Whether we know at compile time that the browser is in
 * quirks mode.
 */
goog.dom.ASSUME_QUIRKS_MODE = false;


/**
 * @define {boolean} Whether we know at compile time that the browser is in
 * standards compliance mode.
 */
goog.dom.ASSUME_STANDARDS_MODE = false;


/**
 * Whether we know the compatibility mode at compile time.
 * @type {boolean}
 * @private
 */
goog.dom.COMPAT_MODE_KNOWN_ =
    goog.dom.ASSUME_QUIRKS_MODE || goog.dom.ASSUME_STANDARDS_MODE;


/**
 * Enumeration for DOM node types (for reference)
 * @enum {number}
 */
goog.dom.NodeType = {
  ELEMENT: 1,
  ATTRIBUTE: 2,
  TEXT: 3,
  CDATA_SECTION: 4,
  ENTITY_REFERENCE: 5,
  ENTITY: 6,
  PROCESSING_INSTRUCTION: 7,
  COMMENT: 8,
  DOCUMENT: 9,
  DOCUMENT_TYPE: 10,
  DOCUMENT_FRAGMENT: 11,
  NOTATION: 12
};


/**
 * Gets the DomHelper object for the document where the element resides.
 * @param {(Node|Window)=} opt_element If present, gets the DomHelper for this
 *     element.
 * @return {!goog.dom.DomHelper} The DomHelper.
 */
goog.dom.getDomHelper = function(opt_element) {
  return opt_element ?
      new goog.dom.DomHelper(goog.dom.getOwnerDocument(opt_element)) :
      (goog.dom.defaultDomHelper_ ||
          (goog.dom.defaultDomHelper_ = new goog.dom.DomHelper()));
};


/**
 * Cached default DOM helper.
 * @type {goog.dom.DomHelper}
 * @private
 */
goog.dom.defaultDomHelper_;


/**
 * Gets the document object being used by the dom library.
 * @return {!Document} Document object.
 */
goog.dom.getDocument = function() {
  return document;
};


/**
 * Alias for getElementById. If a DOM node is passed in then we just return
 * that.
 * @param {string|Element} element Element ID or a DOM node.
 * @return {Element} The element with the given ID, or the node passed in.
 */
goog.dom.getElement = function(element) {
  return goog.isString(element) ?
      document.getElementById(element) : element;
};


/**
 * Alias for getElement.
 * @param {string|Element} element Element ID or a DOM node.
 * @return {Element} The element with the given ID, or the node passed in.
 * @deprecated Use {@link goog.dom.getElement} instead.
 */
goog.dom.$ = goog.dom.getElement;


/**
 * Looks up elements by both tag and class name, using browser native functions
 * ({@code querySelectorAll}, {@code getElementsByTagName} or
 * {@code getElementsByClassName}) where possible. This function
 * is a useful, if limited, way of collecting a list of DOM elements
 * with certain characteristics.  {@code goog.dom.query} offers a
 * more powerful and general solution which allows matching on CSS3
 * selector expressions, but at increased cost in code size. If all you
 * need is particular tags belonging to a single class, this function
 * is fast and sleek.
 *
 * @see {goog.dom.query}
 *
 * @param {?string=} opt_tag Element tag name.
 * @param {?string=} opt_class Optional class name.
 * @param {(Document|Element)=} opt_el Optional element to look in.
 * @return { {length: number} } Array-like list of elements (only a length
 *     property and numerical indices are guaranteed to exist).
 */
goog.dom.getElementsByTagNameAndClass = function(opt_tag, opt_class, opt_el) {
  return goog.dom.getElementsByTagNameAndClass_(document, opt_tag, opt_class,
                                                opt_el);
};


/**
 * Returns an array of all the elements with the provided className.
 * @see {goog.dom.query}
 * @param {string} className the name of the class to look for.
 * @param {(Document|Element)=} opt_el Optional element to look in.
 * @return { {length: number} } The items found with the class name provided.
 */
goog.dom.getElementsByClass = function(className, opt_el) {
  var parent = opt_el || document;
  if (goog.dom.canUseQuerySelector_(parent)) {
    return parent.querySelectorAll('.' + className);
  } else if (parent.getElementsByClassName) {
    return parent.getElementsByClassName(className);
  }
  return goog.dom.getElementsByTagNameAndClass_(
      document, '*', className, opt_el);
};


/**
 * Returns the first element with the provided className.
 * @see {goog.dom.query}
 * @param {string} className the name of the class to look for.
 * @param {Element|Document=} opt_el Optional element to look in.
 * @return {Element} The first item with the class name provided.
 */
goog.dom.getElementByClass = function(className, opt_el) {
  var parent = opt_el || document;
  var retVal = null;
  if (goog.dom.canUseQuerySelector_(parent)) {
    retVal = parent.querySelector('.' + className);
  } else {
    retVal = goog.dom.getElementsByClass(className, opt_el)[0];
  }
  return retVal || null;
};


/**
 * Prefer the standardized (http://www.w3.org/TR/selectors-api/), native and
 * fast W3C Selectors API. However, the version of WebKit that shipped with
 * Safari 3.1 and Chrome has a bug where it will not correctly match mixed-
 * case class name selectors in quirks mode.
 * @param {!(Element|Document)} parent The parent document object.
 * @return {boolean} whether or not we can use parent.querySelector* APIs.
 * @private
 */
goog.dom.canUseQuerySelector_ = function(parent) {
  return parent.querySelectorAll &&
         parent.querySelector &&
         (!goog.userAgent.WEBKIT || goog.dom.isCss1CompatMode_(document) ||
          goog.userAgent.isVersion('528'));
};


/**
 * Helper for {@code getElementsByTagNameAndClass}.
 * @param {!Document} doc The document to get the elements in.
 * @param {?string=} opt_tag Element tag name.
 * @param {?string=} opt_class Optional class name.
 * @param {(Document|Element)=} opt_el Optional element to look in.
 * @return { {length: number} } Array-like list of elements (only a length
 *     property and numerical indices are guaranteed to exist).
 * @private
 */
goog.dom.getElementsByTagNameAndClass_ = function(doc, opt_tag, opt_class,
                                                  opt_el) {
  var parent = opt_el || doc;
  var tagName = (opt_tag && opt_tag != '*') ? opt_tag.toUpperCase() : '';

  if (goog.dom.canUseQuerySelector_(parent) &&
      (tagName || opt_class)) {
    var query = tagName + (opt_class ? '.' + opt_class : '');
    return parent.querySelectorAll(query);
  }

  // Use the native getElementsByClassName if available, under the assumption
  // that even when the tag name is specified, there will be fewer elements to
  // filter through when going by class than by tag name
  if (opt_class && parent.getElementsByClassName) {
    var els = parent.getElementsByClassName(opt_class);

    if (tagName) {
      var arrayLike = {};
      var len = 0;

      // Filter for specific tags if requested.
      for (var i = 0, el; el = els[i]; i++) {
        if (tagName == el.nodeName) {
          arrayLike[len++] = el;
        }
      }
      arrayLike.length = len;

      return arrayLike;
    } else {
      return els;
    }
  }

  var els = parent.getElementsByTagName(tagName || '*');

  if (opt_class) {
    var arrayLike = {};
    var len = 0;
    for (var i = 0, el; el = els[i]; i++) {
      var className = el.className;
      // Check if className has a split function since SVG className does not.
      if (typeof className.split == 'function' &&
          goog.array.contains(className.split(/\s+/), opt_class)) {
        arrayLike[len++] = el;
      }
    }
    arrayLike.length = len;
    return arrayLike;
  } else {
    return els;
  }
};


/**
 * Alias for {@code getElementsByTagNameAndClass}.
 * @param {?string=} opt_tag Element tag name.
 * @param {?string=} opt_class Optional class name.
 * @param {Element=} opt_el Optional element to look in.
 * @return { {length: number} } Array-like list of elements (only a length
 *     property and numerical indices are guaranteed to exist).
 * @deprecated Use {@link goog.dom.getElementsByTagNameAndClass} instead.
 */
goog.dom.$$ = goog.dom.getElementsByTagNameAndClass;


/**
 * Sets multiple properties on a node.
 * @param {Element} element DOM node to set properties on.
 * @param {Object} properties Hash of property:value pairs.
 */
goog.dom.setProperties = function(element, properties) {
  goog.object.forEach(properties, function(val, key) {
    if (key == 'style') {
      element.style.cssText = val;
    } else if (key == 'class') {
      element.className = val;
    } else if (key == 'for') {
      element.htmlFor = val;
    } else if (key in goog.dom.DIRECT_ATTRIBUTE_MAP_) {
      element.setAttribute(goog.dom.DIRECT_ATTRIBUTE_MAP_[key], val);
    } else if (goog.string.startsWith(key, 'aria-')) {
      element.setAttribute(key, val);
    } else {
      element[key] = val;
    }
  });
};


/**
 * Map of attributes that should be set using
 * element.setAttribute(key, val) instead of element[key] = val.  Used
 * by goog.dom.setProperties.
 *
 * @type {Object}
 * @private
 */
goog.dom.DIRECT_ATTRIBUTE_MAP_ = {
  'cellpadding': 'cellPadding',
  'cellspacing': 'cellSpacing',
  'colspan': 'colSpan',
  'rowspan': 'rowSpan',
  'valign': 'vAlign',
  'height': 'height',
  'width': 'width',
  'usemap': 'useMap',
  'frameborder': 'frameBorder',
  'maxlength': 'maxLength',
  'type': 'type'
};


/**
 * Gets the dimensions of the viewport.
 *
 * Gecko Standards mode:
 * docEl.clientWidth  Width of viewport excluding scrollbar.
 * win.innerWidth     Width of viewport including scrollbar.
 * body.clientWidth   Width of body element.
 *
 * docEl.clientHeight Height of viewport excluding scrollbar.
 * win.innerHeight    Height of viewport including scrollbar.
 * body.clientHeight  Height of document.
 *
 * Gecko Backwards compatible mode:
 * docEl.clientWidth  Width of viewport excluding scrollbar.
 * win.innerWidth     Width of viewport including scrollbar.
 * body.clientWidth   Width of viewport excluding scrollbar.
 *
 * docEl.clientHeight Height of document.
 * win.innerHeight    Height of viewport including scrollbar.
 * body.clientHeight  Height of viewport excluding scrollbar.
 *
 * IE6/7 Standards mode:
 * docEl.clientWidth  Width of viewport excluding scrollbar.
 * win.innerWidth     Undefined.
 * body.clientWidth   Width of body element.
 *
 * docEl.clientHeight Height of viewport excluding scrollbar.
 * win.innerHeight    Undefined.
 * body.clientHeight  Height of document element.
 *
 * IE5 + IE6/7 Backwards compatible mode:
 * docEl.clientWidth  0.
 * win.innerWidth     Undefined.
 * body.clientWidth   Width of viewport excluding scrollbar.
 *
 * docEl.clientHeight 0.
 * win.innerHeight    Undefined.
 * body.clientHeight  Height of viewport excluding scrollbar.
 *
 * Opera 9 Standards and backwards compatible mode:
 * docEl.clientWidth  Width of viewport excluding scrollbar.
 * win.innerWidth     Width of viewport including scrollbar.
 * body.clientWidth   Width of viewport excluding scrollbar.
 *
 * docEl.clientHeight Height of document.
 * win.innerHeight    Height of viewport including scrollbar.
 * body.clientHeight  Height of viewport excluding scrollbar.
 *
 * WebKit:
 * Safari 2
 * docEl.clientHeight Same as scrollHeight.
 * docEl.clientWidth  Same as innerWidth.
 * win.innerWidth     Width of viewport excluding scrollbar.
 * win.innerHeight    Height of the viewport including scrollbar.
 * frame.innerHeight  Height of the viewport exluding scrollbar.
 *
 * Safari 3 (tested in 522)
 *
 * docEl.clientWidth  Width of viewport excluding scrollbar.
 * docEl.clientHeight Height of viewport excluding scrollbar in strict mode.
 * body.clientHeight  Height of viewport excluding scrollbar in quirks mode.
 *
 * @param {Window=} opt_window Optional window element to test.
 * @return {!goog.math.Size} Object with values 'width' and 'height'.
 */
goog.dom.getViewportSize = function(opt_window) {
  // TODO(arv): This should not take an argument
  return goog.dom.getViewportSize_(opt_window || window);
};


/**
 * Helper for {@code getViewportSize}.
 * @param {Window} win The window to get the view port size for.
 * @return {!goog.math.Size} Object with values 'width' and 'height'.
 * @private
 */
goog.dom.getViewportSize_ = function(win) {
  var doc = win.document;

  if (goog.userAgent.WEBKIT && !goog.userAgent.isVersion('500') &&
      !goog.userAgent.MOBILE) {
    // TODO(doughtie): Sometimes we get something that isn't a valid window
    // object. In this case we just revert to the current window. We need to
    // figure out when this happens and find a real fix for it.
    // See the comments on goog.dom.getWindow.
    if (typeof win.innerHeight == 'undefined') {
      win = window;
    }
    var innerHeight = win.innerHeight;
    var scrollHeight = win.document.documentElement.scrollHeight;

    if (win == win.top) {
      if (scrollHeight < innerHeight) {
        innerHeight -= 15; // Scrollbars are 15px wide on Mac
      }
    }
    return new goog.math.Size(win.innerWidth, innerHeight);
  }

  var el = goog.dom.isCss1CompatMode_(doc) ? doc.documentElement : doc.body;

  return new goog.math.Size(el.clientWidth, el.clientHeight);
};


/**
 * Calculates the height of the document.
 *
 * @return {number} The height of the current document.
 */
goog.dom.getDocumentHeight = function() {
  return goog.dom.getDocumentHeight_(window);
};


/**
 * Calculates the height of the document of the given window.
 *
 * Function code copied from the opensocial gadget api:
 *   gadgets.window.adjustHeight(opt_height)
 *
 * @private
 * @param {Window} win The window whose document height to retrieve.
 * @return {number} The height of the document of the given window.
 */
goog.dom.getDocumentHeight_ = function(win) {
  // NOTE(eae): This method will return the window size rather than the document
  // size in webkit quirks mode.
  var doc = win.document;
  var height = 0;

  if (doc) {
    // Calculating inner content height is hard and different between
    // browsers rendering in Strict vs. Quirks mode.  We use a combination of
    // three properties within document.body and document.documentElement:
    // - scrollHeight
    // - offsetHeight
    // - clientHeight
    // These values differ significantly between browsers and rendering modes.
    // But there are patterns.  It just takes a lot of time and persistence
    // to figure out.

    // Get the height of the viewport
    var vh = goog.dom.getViewportSize_(win).height;
    var body = doc.body;
    var docEl = doc.documentElement;
    if (goog.dom.isCss1CompatMode_(doc) && docEl.scrollHeight) {
      // In Strict mode:
      // The inner content height is contained in either:
      //    document.documentElement.scrollHeight
      //    document.documentElement.offsetHeight
      // Based on studying the values output by different browsers,
      // use the value that's NOT equal to the viewport height found above.
      height = docEl.scrollHeight != vh ?
          docEl.scrollHeight : docEl.offsetHeight;
    } else {
      // In Quirks mode:
      // documentElement.clientHeight is equal to documentElement.offsetHeight
      // except in IE.  In most browsers, document.documentElement can be used
      // to calculate the inner content height.
      // However, in other browsers (e.g. IE), document.body must be used
      // instead.  How do we know which one to use?
      // If document.documentElement.clientHeight does NOT equal
      // document.documentElement.offsetHeight, then use document.body.
      var sh = docEl.scrollHeight;
      var oh = docEl.offsetHeight;
      if (docEl.clientHeight != oh) {
        sh = body.scrollHeight;
        oh = body.offsetHeight;
      }

      // Detect whether the inner content height is bigger or smaller
      // than the bounding box (viewport).  If bigger, take the larger
      // value.  If smaller, take the smaller value.
      if (sh > vh) {
        // Content is larger
        height = sh > oh ? sh : oh;
      } else {
        // Content is smaller
        height = sh < oh ? sh : oh;
      }
    }
  }

  return height;
};


/**
 * Gets the page scroll distance as a coordinate object.
 *
 * @param {Window=} opt_window Optional window element to test.
 * @return {!goog.math.Coordinate} Object with values 'x' and 'y'.
 * @deprecated Use {@link goog.dom.getDocumentScroll} instead.
 */
goog.dom.getPageScroll = function(opt_window) {
  var win = opt_window || goog.global || window;
  return goog.dom.getDomHelper(win.document).getDocumentScroll();
};


/**
 * Gets the document scroll distance as a coordinate object.
 *
 * @return {!goog.math.Coordinate} Object with values 'x' and 'y'.
 */
goog.dom.getDocumentScroll = function() {
  return goog.dom.getDocumentScroll_(document);
};


/**
 * Helper for {@code getDocumentScroll}.
 *
 * @param {!Document} doc The document to get the scroll for.
 * @return {!goog.math.Coordinate} Object with values 'x' and 'y'.
 * @private
 */
goog.dom.getDocumentScroll_ = function(doc) {
  var el = goog.dom.getDocumentScrollElement_(doc);
  var win = goog.dom.getWindow_(doc);
  return new goog.math.Coordinate(win.pageXOffset || el.scrollLeft,
      win.pageYOffset || el.scrollTop);
};


/**
 * Gets the document scroll element.
 * @return {Element} Scrolling element.
 */
goog.dom.getDocumentScrollElement = function() {
  return goog.dom.getDocumentScrollElement_(document);
};


/**
 * Helper for {@code getDocumentScrollElement}.
 * @param {!Document} doc The document to get the scroll element for.
 * @return {Element} Scrolling element.
 * @private
 */
goog.dom.getDocumentScrollElement_ = function(doc) {
  // Safari (2 and 3) needs body.scrollLeft in both quirks mode and strict mode.
  return !goog.userAgent.WEBKIT && goog.dom.isCss1CompatMode_(doc) ?
      doc.documentElement : doc.body;
};


/**
 * Gets the window object associated with the given document.
 *
 * @param {Document=} opt_doc  Document object to get window for.
 * @return {!Window} The window associated with the given document.
 */
goog.dom.getWindow = function(opt_doc) {
  // TODO(arv): This should not take an argument.
  return opt_doc ? goog.dom.getWindow_(opt_doc) : window;
};


/**
 * Helper for {@code getWindow}.
 *
 * @param {!Document} doc  Document object to get window for.
 * @return {!Window} The window associated with the given document.
 * @private
 */
goog.dom.getWindow_ = function(doc) {
  return doc.parentWindow || doc.defaultView;
};


/**
 * Returns a dom node with a set of attributes.  This function accepts varargs
 * for subsequent nodes to be added.  Subsequent nodes will be added to the
 * first node as childNodes.
 *
 * So:
 * <code>createDom('div', null, createDom('p'), createDom('p'));</code>
 * would return a div with two child paragraphs
 *
 * @param {string} tagName Tag to create.
 * @param {(Object|Array.<string>|string)=} opt_attributes If object, then a map
 *     of name-value pairs for attributes. If a string, then this is the
 *     className of the new element. If an array, the elements will be joined
 *     together as the className of the new element.
 * @param {...(Object|string|Array|NodeList)} var_args Further DOM nodes or
 *     strings for text nodes. If one of the var_args is an array or NodeList,i
 *     its elements will be added as childNodes instead.
 * @return {!Element} Reference to a DOM node.
 */
goog.dom.createDom = function(tagName, opt_attributes, var_args) {
  return goog.dom.createDom_(document, arguments);
};


/**
 * Helper for {@code createDom}.
 * @param {!Document} doc The document to create the DOM in.
 * @param {!Arguments} args Argument object passed from the callers. See
 *     {@code goog.dom.createDom} for details.
 * @return {!Element} Reference to a DOM node.
 * @private
 */
goog.dom.createDom_ = function(doc, args) {
  var tagName = args[0];
  var attributes = args[1];

  // Internet Explorer is dumb: http://msdn.microsoft.com/workshop/author/
  //                            dhtml/reference/properties/name_2.asp
  // Also does not allow setting of 'type' attribute on 'input' or 'button'.
  if (!goog.dom.BrowserFeature.CAN_ADD_NAME_OR_TYPE_ATTRIBUTES && attributes &&
      (attributes.name || attributes.type)) {
    var tagNameArr = ['<', tagName];
    if (attributes.name) {
      tagNameArr.push(' name="', goog.string.htmlEscape(attributes.name),
                      '"');
    }
    if (attributes.type) {
      tagNameArr.push(' type="', goog.string.htmlEscape(attributes.type),
                      '"');

      // Clone attributes map to remove 'type' without mutating the input.
      var clone = {};
      goog.object.extend(clone, attributes);
      attributes = clone;
      delete attributes.type;
    }
    tagNameArr.push('>');
    tagName = tagNameArr.join('');
  }

  var element = doc.createElement(tagName);

  if (attributes) {
    if (goog.isString(attributes)) {
      element.className = attributes;
    } else if (goog.isArray(attributes)) {
      goog.dom.classes.add.apply(null, [element].concat(attributes));
    } else {
      goog.dom.setProperties(element, attributes);
    }
  }

  if (args.length > 2) {
    goog.dom.append_(doc, element, args, 2);
  }

  return element;
};


/**
 * Appends a node with text or other nodes.
 * @param {!Document} doc The document to create new nodes in.
 * @param {!Node} parent The node to append nodes to.
 * @param {!Arguments} args The values to add. See {@code goog.dom.append}.
 * @param {number} startIndex The index of the array to start from.
 * @private
 */
goog.dom.append_ = function(doc, parent, args, startIndex) {
  function childHandler(child) {
    // TODO(user): More coercion, ala MochiKit?
    if (child) {
      parent.appendChild(goog.isString(child) ?
          doc.createTextNode(child) : child);
    }
  }

  for (var i = startIndex; i < args.length; i++) {
    var arg = args[i];
    // TODO(attila): Fix isArrayLike to return false for a text node.
    if (goog.isArrayLike(arg) && !goog.dom.isNodeLike(arg)) {
      // If the argument is a node list, not a real array, use a clone,
      // because forEach can't be used to mutate a NodeList.
      goog.array.forEach(goog.dom.isNodeList(arg) ?
          goog.array.clone(arg) : arg,
          childHandler);
    } else {
      childHandler(arg);
    }
  }
};


/**
 * Alias for {@code createDom}.
 * @param {string} tagName Tag to create.
 * @param {(string|Object)=} opt_attributes If object, then a map of name-value
 *     pairs for attributes. If a string, then this is the className of the new
 *     element.
 * @param {...(Object|string|Array|NodeList)} var_args Further DOM nodes or
 *     strings for text nodes. If one of the var_args is an array, its
 *     children will be added as childNodes instead.
 * @return {!Element} Reference to a DOM node.
 * @deprecated Use {@link goog.dom.createDom} instead.
 */
goog.dom.$dom = goog.dom.createDom;


/**
 * Creates a new element.
 * @param {string} name Tag name.
 * @return {!Element} The new element.
 */
goog.dom.createElement = function(name) {
  return document.createElement(name);
};


/**
 * Creates a new text node.
 * @param {string} content Content.
 * @return {!Text} The new text node.
 */
goog.dom.createTextNode = function(content) {
  return document.createTextNode(content);
};


/**
 * Create a table.
 * @param {number} rows The number of rows in the table.  Must be >= 1.
 * @param {number} columns The number of columns in the table.  Must be >= 1.
 * @param {boolean=} opt_fillWithNbsp If true, fills table entries with nsbps.
 * @return {!Element} The created table.
 */
goog.dom.createTable = function(rows, columns, opt_fillWithNbsp) {
  return goog.dom.createTable_(document, rows, columns, !!opt_fillWithNbsp);
};


/**
 * Create a table.
 * @param {!Document} doc Document object to use to create the table.
 * @param {number} rows The number of rows in the table.  Must be >= 1.
 * @param {number} columns The number of columns in the table.  Must be >= 1.
 * @param {boolean} fillWithNbsp If true, fills table entries with nsbps.
 * @return {!Element} The created table.
 * @private
 */
goog.dom.createTable_ = function(doc, rows, columns, fillWithNbsp) {
  var rowHtml = ['<tr>'];
  for (var i = 0; i < columns; i++) {
    rowHtml.push(fillWithNbsp ? '<td>&nbsp;</td>' : '<td></td>');
  }
  rowHtml.push('</tr>');
  rowHtml = rowHtml.join('');
  var totalHtml = ['<table>'];
  for (i = 0; i < rows; i++) {
    totalHtml.push(rowHtml);
  }
  totalHtml.push('</table>');

  var elem = doc.createElement(goog.dom.TagName.DIV);
  elem.innerHTML = totalHtml.join('');
  return /** @type {!Element} */ (elem.removeChild(elem.firstChild));
};


/**
 * Converts an HTML string into a document fragment.
 *
 * @param {string} htmlString The HTML string to convert.
 * @return {!Node} The resulting document fragment.
 */
goog.dom.htmlToDocumentFragment = function(htmlString) {
  return goog.dom.htmlToDocumentFragment_(document, htmlString);
};


/**
 * Helper for {@code htmlToDocumentFragment}.
 *
 * @param {!Document} doc The document.
 * @param {string} htmlString The HTML string to convert.
 * @return {!Node} The resulting document fragment.
 * @private
 */
goog.dom.htmlToDocumentFragment_ = function(doc, htmlString) {
  var tempDiv = doc.createElement('div');
  if (goog.dom.BrowserFeature.INNER_HTML_NEEDS_SCOPED_ELEMENT) {
    tempDiv.innerHTML = '<br>' + htmlString;
    tempDiv.removeChild(tempDiv.firstChild);
  } else {
    tempDiv.innerHTML = htmlString;
  }
  if (tempDiv.childNodes.length == 1) {
    return /** @type {!Node} */ (tempDiv.removeChild(tempDiv.firstChild));
  } else {
    var fragment = doc.createDocumentFragment();
    while (tempDiv.firstChild) {
      fragment.appendChild(tempDiv.firstChild);
    }
    return fragment;
  }
};


/**
 * Returns the compatMode of the document.
 * @return {string} The result is either CSS1Compat or BackCompat.
 * @deprecated use goog.dom.isCss1CompatMode instead.
 */
goog.dom.getCompatMode = function() {
  return goog.dom.isCss1CompatMode() ? 'CSS1Compat' : 'BackCompat';
};


/**
 * Returns true if the browser is in "CSS1-compatible" (standards-compliant)
 * mode, false otherwise.
 * @return {boolean} True if in CSS1-compatible mode.
 */
goog.dom.isCss1CompatMode = function() {
  return goog.dom.isCss1CompatMode_(document);
};


/**
 * Returns true if the browser is in "CSS1-compatible" (standards-compliant)
 * mode, false otherwise.
 * @param {Document} doc The document to check.
 * @return {boolean} True if in CSS1-compatible mode.
 * @private
 */
goog.dom.isCss1CompatMode_ = function(doc) {
  if (goog.dom.COMPAT_MODE_KNOWN_) {
    return goog.dom.ASSUME_STANDARDS_MODE;
  }

  return doc.compatMode == 'CSS1Compat';
};


/**
 * Determines if the given node can contain children, intended to be used for
 * HTML generation.
 *
 * IE natively supports node.canHaveChildren but has inconsistent behavior.
 * Prior to IE8 the base tag allows children and in IE9 all nodes return true
 * for canHaveChildren.
 *
 * In practice all non-IE browsers allow you to add children to any node, but
 * the behavior is inconsistent:
 *
 * <pre>
 *   var a = document.createElement('br');
 *   a.appendChild(document.createTextNode('foo'));
 *   a.appendChild(document.createTextNode('bar'));
 *   console.log(a.childNodes.length);  // 2
 *   console.log(a.innerHTML);  // Chrome: "", IE9: "foobar", FF3.5: "foobar"
 * </pre>
 *
 * TODO(user): Rename shouldAllowChildren() ?
 *
 * @param {Node} node The node to check.
 * @return {boolean} Whether the node can contain children.
 */
goog.dom.canHaveChildren = function(node) {
  if (node.nodeType != goog.dom.NodeType.ELEMENT) {
    return false;
  }
  switch (node.tagName) {
    case goog.dom.TagName.APPLET:
    case goog.dom.TagName.AREA:
    case goog.dom.TagName.BASE:
    case goog.dom.TagName.BR:
    case goog.dom.TagName.COL:
    case goog.dom.TagName.FRAME:
    case goog.dom.TagName.HR:
    case goog.dom.TagName.IMG:
    case goog.dom.TagName.INPUT:
    case goog.dom.TagName.IFRAME:
    case goog.dom.TagName.ISINDEX:
    case goog.dom.TagName.LINK:
    case goog.dom.TagName.NOFRAMES:
    case goog.dom.TagName.NOSCRIPT:
    case goog.dom.TagName.META:
    case goog.dom.TagName.OBJECT:
    case goog.dom.TagName.PARAM:
    case goog.dom.TagName.SCRIPT:
    case goog.dom.TagName.STYLE:
      return false;
  }
  return true;
};


/**
 * Appends a child to a node.
 * @param {Node} parent Parent.
 * @param {Node} child Child.
 */
goog.dom.appendChild = function(parent, child) {
  parent.appendChild(child);
};


/**
 * Appends a node with text or other nodes.
 * @param {!Node} parent The node to append nodes to.
 * @param {...goog.dom.Appendable} var_args The things to append to the node.
 *     If this is a Node it is appended as is.
 *     If this is a string then a text node is appended.
 *     If this is an array like object then fields 0 to length - 1 are appended.
 */
goog.dom.append = function(parent, var_args) {
  goog.dom.append_(goog.dom.getOwnerDocument(parent), parent, arguments, 1);
};


/**
 * Removes all the child nodes on a DOM node.
 * @param {Node} node Node to remove children from.
 */
goog.dom.removeChildren = function(node) {
  // Note: Iterations over live collections can be slow, this is the fastest
  // we could find. The double parenthesis are used to prevent JsCompiler and
  // strict warnings.
  var child;
  while ((child = node.firstChild)) {
    node.removeChild(child);
  }
};


/**
 * Inserts a new node before an existing reference node (i.e. as the previous
 * sibling). If the reference node has no parent, then does nothing.
 * @param {Node} newNode Node to insert.
 * @param {Node} refNode Reference node to insert before.
 */
goog.dom.insertSiblingBefore = function(newNode, refNode) {
  if (refNode.parentNode) {
    refNode.parentNode.insertBefore(newNode, refNode);
  }
};


/**
 * Inserts a new node after an existing reference node (i.e. as the next
 * sibling). If the reference node has no parent, then does nothing.
 * @param {Node} newNode Node to insert.
 * @param {Node} refNode Reference node to insert after.
 */
goog.dom.insertSiblingAfter = function(newNode, refNode) {
  if (refNode.parentNode) {
    refNode.parentNode.insertBefore(newNode, refNode.nextSibling);
  }
};


/**
 * Insert a child at a given index. If index is larger than the number of child
 * nodes that the parent currently has, the node is inserted as the last child
 * node.
 * @param {Element} parent The element into which to insert the child.
 * @param {Node} child The element to insert.
 * @param {number} index The index at which to insert the new child node. Must
 *     not be negative.
 */
goog.dom.insertChildAt = function(parent, child, index) {
  // Note that if the second argument is null, insertBefore
  // will append the child at the end of the list of children.
  parent.insertBefore(child, parent.childNodes[index] || null);
};


/**
 * Removes a node from its parent.
 * @param {Node} node The node to remove.
 * @return {Node} The node removed if removed; else, null.
 */
goog.dom.removeNode = function(node) {
  return node && node.parentNode ? node.parentNode.removeChild(node) : null;
};


/**
 * Replaces a node in the DOM tree. Will do nothing if {@code oldNode} has no
 * parent.
 * @param {Node} newNode Node to insert.
 * @param {Node} oldNode Node to replace.
 */
goog.dom.replaceNode = function(newNode, oldNode) {
  var parent = oldNode.parentNode;
  if (parent) {
    parent.replaceChild(newNode, oldNode);
  }
};


/**
 * Flattens an element. That is, removes it and replace it with its children.
 * Does nothing if the element is not in the document.
 * @param {Element} element The element to flatten.
 * @return {Element|undefined} The original element, detached from the document
 *     tree, sans children; or undefined, if the element was not in the document
 *     to begin with.
 */
goog.dom.flattenElement = function(element) {
  var child, parent = element.parentNode;
  if (parent && parent.nodeType != goog.dom.NodeType.DOCUMENT_FRAGMENT) {
    // Use IE DOM method (supported by Opera too) if available
    if (element.removeNode) {
      return /** @type {Element} */ (element.removeNode(false));
    } else {
      // Move all children of the original node up one level.
      while ((child = element.firstChild)) {
        parent.insertBefore(child, element);
      }

      // Detach the original element.
      return /** @type {Element} */ (goog.dom.removeNode(element));
    }
  }
};


/**
 * Returns an array containing just the element children of the given element.
 * @param {Element} element The element whose element children we want.
 * @return {!(Array|NodeList)} An array or array-like list of just the element
 *     children of the given element.
 */
goog.dom.getChildren = function(element) {
  // We check if the children attribute is supported for child elements
  // since IE8 misuses the attribute by also including comments.
  if (goog.dom.BrowserFeature.CAN_USE_CHILDREN_ATTRIBUTE &&
      element.children != undefined) {
    return element.children;
  }
  // Fall back to manually filtering the element's child nodes.
  return goog.array.filter(element.childNodes, function(node) {
    return node.nodeType == goog.dom.NodeType.ELEMENT;
  });
};


/**
 * Returns the first child node that is an element.
 * @param {Node} node The node to get the first child element of.
 * @return {Element} The first child node of {@code node} that is an element.
 */
goog.dom.getFirstElementChild = function(node) {
  if (node.firstElementChild != undefined) {
    return /** @type {Element} */(node).firstElementChild;
  }
  return goog.dom.getNextElementNode_(node.firstChild, true);
};


/**
 * Returns the last child node that is an element.
 * @param {Node} node The node to get the last child element of.
 * @return {Element} The last child node of {@code node} that is an element.
 */
goog.dom.getLastElementChild = function(node) {
  if (node.lastElementChild != undefined) {
    return /** @type {Element} */(node).lastElementChild;
  }
  return goog.dom.getNextElementNode_(node.lastChild, false);
};


/**
 * Returns the first next sibling that is an element.
 * @param {Node} node The node to get the next sibling element of.
 * @return {Element} The next sibling of {@code node} that is an element.
 */
goog.dom.getNextElementSibling = function(node) {
  if (node.nextElementSibling != undefined) {
    return /** @type {Element} */(node).nextElementSibling;
  }
  return goog.dom.getNextElementNode_(node.nextSibling, true);
};


/**
 * Returns the first previous sibling that is an element.
 * @param {Node} node The node to get the previous sibling element of.
 * @return {Element} The first previous sibling of {@code node} that is
 *     an element.
 */
goog.dom.getPreviousElementSibling = function(node) {
  if (node.previousElementSibling != undefined) {
    return /** @type {Element} */(node).previousElementSibling;
  }
  return goog.dom.getNextElementNode_(node.previousSibling, false);
};


/**
 * Returns the first node that is an element in the specified direction,
 * starting with {@code node}.
 * @param {Node} node The node to get the next element from.
 * @param {boolean} forward Whether to look forwards or backwards.
 * @return {Element} The first element.
 * @private
 */
goog.dom.getNextElementNode_ = function(node, forward) {
  while (node && node.nodeType != goog.dom.NodeType.ELEMENT) {
    node = forward ? node.nextSibling : node.previousSibling;
  }

  return /** @type {Element} */ (node);
};


/**
 * Returns the next node in source order from the given node.
 * @param {Node} node The node.
 * @return {Node} The next node in the DOM tree, or null if this was the last
 *     node.
 */
goog.dom.getNextNode = function(node) {
  if (!node) {
    return null;
  }

  if (node.firstChild) {
    return node.firstChild;
  }

  while (node && !node.nextSibling) {
    node = node.parentNode;
  }

  return node ? node.nextSibling : null;
};


/**
 * Returns the previous node in source order from the given node.
 * @param {Node} node The node.
 * @return {Node} The previous node in the DOM tree, or null if this was the
 *     first node.
 */
goog.dom.getPreviousNode = function(node) {
  if (!node) {
    return null;
  }

  if (!node.previousSibling) {
    return node.parentNode;
  }

  node = node.previousSibling;
  while (node && node.lastChild) {
    node = node.lastChild;
  }

  return node;
};


/**
 * Whether the object looks like a DOM node.
 * @param {*} obj The object being tested for node likeness.
 * @return {boolean} Whether the object looks like a DOM node.
 */
goog.dom.isNodeLike = function(obj) {
  return goog.isObject(obj) && obj.nodeType > 0;
};


/**
 * Whether the object looks like an Element.
 * @param {*} obj The object being tested for Element likeness.
 * @return {boolean} Whether the object looks like an Element.
 */
goog.dom.isElement = function(obj) {
  return goog.isObject(obj) && obj.nodeType == goog.dom.NodeType.ELEMENT;
};


/**
 * Returns true if the specified value is a Window object. This includes the
 * global window for HTML pages, and iframe windows.
 * @param {*} obj Variable to test.
 * @return {boolean} Whether the variable is a window.
 */
goog.dom.isWindow = function(obj) {
  return goog.isObject(obj) && obj['window'] == obj;
};


/**
 * Returns an element's parent, if it's an Element.
 * @param {Element} element The DOM element.
 * @return {Element} The parent, or null if not an Element.
 */
goog.dom.getParentElement = function(element) {
  if (goog.dom.BrowserFeature.CAN_USE_PARENT_ELEMENT_PROPERTY) {
    return element.parentElement;
  }
  var parent = element.parentNode;
  return goog.dom.isElement(parent) ? (/** @type {!Element} */ parent) : null;
};


/**
 * Whether a node contains another node.
 * @param {Node} parent The node that should contain the other node.
 * @param {Node} descendant The node to test presence of.
 * @return {boolean} Whether the parent node contains the descendent node.
 */
goog.dom.contains = function(parent, descendant) {
  // We use browser specific methods for this if available since it is faster
  // that way.

  // IE DOM
  if (parent.contains && descendant.nodeType == goog.dom.NodeType.ELEMENT) {
    return parent == descendant || parent.contains(descendant);
  }

  // W3C DOM Level 3
  if (typeof parent.compareDocumentPosition != 'undefined') {
    return parent == descendant ||
        Boolean(parent.compareDocumentPosition(descendant) & 16);
  }

  // W3C DOM Level 1
  while (descendant && parent != descendant) {
    descendant = descendant.parentNode;
  }
  return descendant == parent;
};


/**
 * Compares the document order of two nodes, returning 0 if they are the same
 * node, a negative number if node1 is before node2, and a positive number if
 * node2 is before node1.  Note that we compare the order the tags appear in the
 * document so in the tree <b><i>text</i></b> the B node is considered to be
 * before the I node.
 *
 * @param {Node} node1 The first node to compare.
 * @param {Node} node2 The second node to compare.
 * @return {number} 0 if the nodes are the same node, a negative number if node1
 *     is before node2, and a positive number if node2 is before node1.
 */
goog.dom.compareNodeOrder = function(node1, node2) {
  // Fall out quickly for equality.
  if (node1 == node2) {
    return 0;
  }

  // Use compareDocumentPosition where available
  if (node1.compareDocumentPosition) {
    // 4 is the bitmask for FOLLOWS.
    return node1.compareDocumentPosition(node2) & 2 ? 1 : -1;
  }

  // Process in IE using sourceIndex - we check to see if the first node has
  // a source index or if its parent has one.
  if ('sourceIndex' in node1 ||
      (node1.parentNode && 'sourceIndex' in node1.parentNode)) {
    var isElement1 = node1.nodeType == goog.dom.NodeType.ELEMENT;
    var isElement2 = node2.nodeType == goog.dom.NodeType.ELEMENT;

    if (isElement1 && isElement2) {
      return node1.sourceIndex - node2.sourceIndex;
    } else {
      var parent1 = node1.parentNode;
      var parent2 = node2.parentNode;

      if (parent1 == parent2) {
        return goog.dom.compareSiblingOrder_(node1, node2);
      }

      if (!isElement1 && goog.dom.contains(parent1, node2)) {
        return -1 * goog.dom.compareParentsDescendantNodeIe_(node1, node2);
      }


      if (!isElement2 && goog.dom.contains(parent2, node1)) {
        return goog.dom.compareParentsDescendantNodeIe_(node2, node1);
      }

      return (isElement1 ? node1.sourceIndex : parent1.sourceIndex) -
             (isElement2 ? node2.sourceIndex : parent2.sourceIndex);
    }
  }

  // For Safari, we compare ranges.
  var doc = goog.dom.getOwnerDocument(node1);

  var range1, range2;
  range1 = doc.createRange();
  range1.selectNode(node1);
  range1.collapse(true);

  range2 = doc.createRange();
  range2.selectNode(node2);
  range2.collapse(true);

  return range1.compareBoundaryPoints(goog.global['Range'].START_TO_END,
      range2);
};


/**
 * Utility function to compare the position of two nodes, when
 * {@code textNode}'s parent is an ancestor of {@code node}.  If this entry
 * condition is not met, this function will attempt to reference a null object.
 * @param {Node} textNode The textNode to compare.
 * @param {Node} node The node to compare.
 * @return {number} -1 if node is before textNode, +1 otherwise.
 * @private
 */
goog.dom.compareParentsDescendantNodeIe_ = function(textNode, node) {
  var parent = textNode.parentNode;
  if (parent == node) {
    // If textNode is a child of node, then node comes first.
    return -1;
  }
  var sibling = node;
  while (sibling.parentNode != parent) {
    sibling = sibling.parentNode;
  }
  return goog.dom.compareSiblingOrder_(sibling, textNode);
};


/**
 * Utility function to compare the position of two nodes known to be non-equal
 * siblings.
 * @param {Node} node1 The first node to compare.
 * @param {Node} node2 The second node to compare.
 * @return {number} -1 if node1 is before node2, +1 otherwise.
 * @private
 */
goog.dom.compareSiblingOrder_ = function(node1, node2) {
  var s = node2;
  while ((s = s.previousSibling)) {
    if (s == node1) {
      // We just found node1 before node2.
      return -1;
    }
  }

  // Since we didn't find it, node1 must be after node2.
  return 1;
};


/**
 * Find the deepest common ancestor of the given nodes.
 * @param {...Node} var_args The nodes to find a common ancestor of.
 * @return {Node} The common ancestor of the nodes, or null if there is none.
 *     null will only be returned if two or more of the nodes are from different
 *     documents.
 */
goog.dom.findCommonAncestor = function(var_args) {
  var i, count = arguments.length;
  if (!count) {
    return null;
  } else if (count == 1) {
    return arguments[0];
  }

  var paths = [];
  var minLength = Infinity;
  for (i = 0; i < count; i++) {
    // Compute the list of ancestors.
    var ancestors = [];
    var node = arguments[i];
    while (node) {
      ancestors.unshift(node);
      node = node.parentNode;
    }

    // Save the list for comparison.
    paths.push(ancestors);
    minLength = Math.min(minLength, ancestors.length);
  }
  var output = null;
  for (i = 0; i < minLength; i++) {
    var first = paths[0][i];
    for (var j = 1; j < count; j++) {
      if (first != paths[j][i]) {
        return output;
      }
    }
    output = first;
  }
  return output;
};


/**
 * Returns the owner document for a node.
 * @param {Node|Window} node The node to get the document for.
 * @return {!Document} The document owning the node.
 */
goog.dom.getOwnerDocument = function(node) {
  // TODO(arv): Remove IE5 code.
  // IE5 uses document instead of ownerDocument
  return /** @type {!Document} */ (
      node.nodeType == goog.dom.NodeType.DOCUMENT ? node :
      node.ownerDocument || node.document);
};


/**
 * Cross-browser function for getting the document element of a frame or iframe.
 * @param {Element} frame Frame element.
 * @return {!Document} The frame content document.
 */
goog.dom.getFrameContentDocument = function(frame) {
  var doc = frame.contentDocument || frame.contentWindow.document;
  return doc;
};


/**
 * Cross-browser function for getting the window of a frame or iframe.
 * @param {HTMLIFrameElement|HTMLFrameElement} frame Frame element.
 * @return {Window} The window associated with the given frame.
 */
goog.dom.getFrameContentWindow = function(frame) {
  return frame.contentWindow ||
      goog.dom.getWindow_(goog.dom.getFrameContentDocument(frame));
};


/**
 * Cross-browser function for setting the text content of an element.
 * @param {Element} element The element to change the text content of.
 * @param {string} text The string that should replace the current element
 *     content.
 */
goog.dom.setTextContent = function(element, text) {
  if ('textContent' in element) {
    element.textContent = text;
  } else if (element.firstChild &&
             element.firstChild.nodeType == goog.dom.NodeType.TEXT) {
    // If the first child is a text node we just change its data and remove the
    // rest of the children.
    while (element.lastChild != element.firstChild) {
      element.removeChild(element.lastChild);
    }
    element.firstChild.data = text;
  } else {
    goog.dom.removeChildren(element);
    var doc = goog.dom.getOwnerDocument(element);
    element.appendChild(doc.createTextNode(text));
  }
};


/**
 * Gets the outerHTML of a node, which islike innerHTML, except that it
 * actually contains the HTML of the node itself.
 * @param {Element} element The element to get the HTML of.
 * @return {string} The outerHTML of the given element.
 */
goog.dom.getOuterHtml = function(element) {
  // IE, Opera and WebKit all have outerHTML.
  if ('outerHTML' in element) {
    return element.outerHTML;
  } else {
    var doc = goog.dom.getOwnerDocument(element);
    var div = doc.createElement('div');
    div.appendChild(element.cloneNode(true));
    return div.innerHTML;
  }
};


/**
 * Finds the first descendant node that matches the filter function, using
 * a depth first search. This function offers the most general purpose way
 * of finding a matching element. You may also wish to consider
 * {@code goog.dom.query} which can express many matching criteria using
 * CSS selector expressions. These expressions often result in a more
 * compact representation of the desired result.
 * @see goog.dom.query
 *
 * @param {Node} root The root of the tree to search.
 * @param {function(Node) : boolean} p The filter function.
 * @return {Node|undefined} The found node or undefined if none is found.
 */
goog.dom.findNode = function(root, p) {
  var rv = [];
  var found = goog.dom.findNodes_(root, p, rv, true);
  return found ? rv[0] : undefined;
};


/**
 * Finds all the descendant nodes that match the filter function, using a
 * a depth first search. This function offers the most general-purpose way
 * of finding a set of matching elements. You may also wish to consider
 * {@code goog.dom.query} which can express many matching criteria using
 * CSS selector expressions. These expressions often result in a more
 * compact representation of the desired result.

 * @param {Node} root The root of the tree to search.
 * @param {function(Node) : boolean} p The filter function.
 * @return {!Array.<!Node>} The found nodes or an empty array if none are found.
 */
goog.dom.findNodes = function(root, p) {
  var rv = [];
  goog.dom.findNodes_(root, p, rv, false);
  return rv;
};


/**
 * Finds the first or all the descendant nodes that match the filter function,
 * using a depth first search.
 * @param {Node} root The root of the tree to search.
 * @param {function(Node) : boolean} p The filter function.
 * @param {!Array.<!Node>} rv The found nodes are added to this array.
 * @param {boolean} findOne If true we exit after the first found node.
 * @return {boolean} Whether the search is complete or not. True in case findOne
 *     is true and the node is found. False otherwise.
 * @private
 */
goog.dom.findNodes_ = function(root, p, rv, findOne) {
  if (root != null) {
    var child = root.firstChild;
    while (child) {
      if (p(child)) {
        rv.push(child);
        if (findOne) {
          return true;
        }
      }
      if (goog.dom.findNodes_(child, p, rv, findOne)) {
        return true;
      }
      child = child.nextSibling;
    }
  }
  return false;
};


/**
 * Map of tags whose content to ignore when calculating text length.
 * @type {Object}
 * @private
 */
goog.dom.TAGS_TO_IGNORE_ = {
  'SCRIPT': 1,
  'STYLE': 1,
  'HEAD': 1,
  'IFRAME': 1,
  'OBJECT': 1
};


/**
 * Map of tags which have predefined values with regard to whitespace.
 * @type {Object}
 * @private
 */
goog.dom.PREDEFINED_TAG_VALUES_ = {'IMG': ' ', 'BR': '\n'};


/**
 * Returns true if the element has a tab index that allows it to receive
 * keyboard focus (tabIndex >= 0), false otherwise.  Note that form elements
 * natively support keyboard focus, even if they have no tab index.
 * @param {Element} element Element to check.
 * @return {boolean} Whether the element has a tab index that allows keyboard
 *     focus.
 * @see http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
 */
goog.dom.isFocusableTabIndex = function(element) {
  // IE returns 0 for an unset tabIndex, so we must use getAttributeNode(),
  // which returns an object with a 'specified' property if tabIndex is
  // specified.  This works on other browsers, too.
  var attrNode = element.getAttributeNode('tabindex'); // Must be lowercase!
  if (attrNode && attrNode.specified) {
    var index = element.tabIndex;
    // NOTE: IE9 puts tabIndex in 16-bit int, e.g. -2 is 65534.
    return goog.isNumber(index) && index >= 0 && index < 32768;
  }
  return false;
};


/**
 * Enables or disables keyboard focus support on the element via its tab index.
 * Only elements for which {@link goog.dom.isFocusableTabIndex} returns true
 * (or elements that natively support keyboard focus, like form elements) can
 * receive keyboard focus.  See http://go/tabindex for more info.
 * @param {Element} element Element whose tab index is to be changed.
 * @param {boolean} enable Whether to set or remove a tab index on the element
 *     that supports keyboard focus.
 */
goog.dom.setFocusableTabIndex = function(element, enable) {
  if (enable) {
    element.tabIndex = 0;
  } else {
    // Set tabIndex to -1 first, then remove it. This is a workaround for
    // Safari (confirmed in version 4 on Windows). When removing the attribute
    // without setting it to -1 first, the element remains keyboard focusable
    // despite not having a tabIndex attribute anymore.
    element.tabIndex = -1;
    element.removeAttribute('tabIndex'); // Must be camelCase!
  }
};


/**
 * Returns the text content of the current node, without markup and invisible
 * symbols. New lines are stripped and whitespace is collapsed,
 * such that each character would be visible.
 *
 * In browsers that support it, innerText is used.  Other browsers attempt to
 * simulate it via node traversal.  Line breaks are canonicalized in IE.
 *
 * @param {Node} node The node from which we are getting content.
 * @return {string} The text content.
 */
goog.dom.getTextContent = function(node) {
  var textContent;
  // Note(arv): IE9, Opera, and Safari 3 support innerText but they include
  // text nodes in script tags. So we revert to use a user agent test here.
  if (goog.dom.BrowserFeature.CAN_USE_INNER_TEXT && ('innerText' in node)) {
    textContent = goog.string.canonicalizeNewlines(node.innerText);
    // Unfortunately .innerText() returns text with &shy; symbols
    // We need to filter it out and then remove duplicate whitespaces
  } else {
    var buf = [];
    goog.dom.getTextContent_(node, buf, true);
    textContent = buf.join('');
  }

  // Strip &shy; entities. goog.format.insertWordBreaks inserts them in Opera.
  textContent = textContent.replace(/ \xAD /g, ' ').replace(/\xAD/g, '');
  // Strip &#8203; entities. goog.format.insertWordBreaks inserts them in IE8.
  textContent = textContent.replace(/\u200B/g, '');

  // Skip this replacement on old browsers with working innerText, which
  // automatically turns &nbsp; into ' ' and / +/ into ' ' when reading
  // innerText.
  if (!goog.dom.BrowserFeature.CAN_USE_INNER_TEXT) {
    textContent = textContent.replace(/ +/g, ' ');
  }
  if (textContent != ' ') {
    textContent = textContent.replace(/^\s*/, '');
  }

  return textContent;
};


/**
 * Returns the text content of the current node, without markup.
 *
 * Unlike {@code getTextContent} this method does not collapse whitespaces
 * or normalize lines breaks.
 *
 * @param {Node} node The node from which we are getting content.
 * @return {string} The raw text content.
 */
goog.dom.getRawTextContent = function(node) {
  var buf = [];
  goog.dom.getTextContent_(node, buf, false);

  return buf.join('');
};


/**
 * Recursive support function for text content retrieval.
 *
 * @param {Node} node The node from which we are getting content.
 * @param {Array} buf string buffer.
 * @param {boolean} normalizeWhitespace Whether to normalize whitespace.
 * @private
 */
goog.dom.getTextContent_ = function(node, buf, normalizeWhitespace) {
  if (node.nodeName in goog.dom.TAGS_TO_IGNORE_) {
    // ignore certain tags
  } else if (node.nodeType == goog.dom.NodeType.TEXT) {
    if (normalizeWhitespace) {
      buf.push(String(node.nodeValue).replace(/(\r\n|\r|\n)/g, ''));
    } else {
      buf.push(node.nodeValue);
    }
  } else if (node.nodeName in goog.dom.PREDEFINED_TAG_VALUES_) {
    buf.push(goog.dom.PREDEFINED_TAG_VALUES_[node.nodeName]);
  } else {
    var child = node.firstChild;
    while (child) {
      goog.dom.getTextContent_(child, buf, normalizeWhitespace);
      child = child.nextSibling;
    }
  }
};


/**
 * Returns the text length of the text contained in a node, without markup. This
 * is equivalent to the selection length if the node was selected, or the number
 * of cursor movements to traverse the node. Images & BRs take one space.  New
 * lines are ignored.
 *
 * @param {Node} node The node whose text content length is being calculated.
 * @return {number} The length of {@code node}'s text content.
 */
goog.dom.getNodeTextLength = function(node) {
  return goog.dom.getTextContent(node).length;
};


/**
 * Returns the text offset of a node relative to one of its ancestors. The text
 * length is the same as the length calculated by goog.dom.getNodeTextLength.
 *
 * @param {Node} node The node whose offset is being calculated.
 * @param {Node=} opt_offsetParent The node relative to which the offset will
 *     be calculated. Defaults to the node's owner document's body.
 * @return {number} The text offset.
 */
goog.dom.getNodeTextOffset = function(node, opt_offsetParent) {
  var root = opt_offsetParent || goog.dom.getOwnerDocument(node).body;
  var buf = [];
  while (node && node != root) {
    var cur = node;
    while ((cur = cur.previousSibling)) {
      buf.unshift(goog.dom.getTextContent(cur));
    }
    node = node.parentNode;
  }
  // Trim left to deal with FF cases when there might be line breaks and empty
  // nodes at the front of the text
  return goog.string.trimLeft(buf.join('')).replace(/ +/g, ' ').length;
};


/**
 * Returns the node at a given offset in a parent node.  If an object is
 * provided for the optional third parameter, the node and the remainder of the
 * offset will stored as properties of this object.
 * @param {Node} parent The parent node.
 * @param {number} offset The offset into the parent node.
 * @param {Object=} opt_result Object to be used to store the return value. The
 *     return value will be stored in the form {node: Node, remainder: number}
 *     if this object is provided.
 * @return {Node} The node at the given offset.
 */
goog.dom.getNodeAtOffset = function(parent, offset, opt_result) {
  var stack = [parent], pos = 0, cur;
  while (stack.length > 0 && pos < offset) {
    cur = stack.pop();
    if (cur.nodeName in goog.dom.TAGS_TO_IGNORE_) {
      // ignore certain tags
    } else if (cur.nodeType == goog.dom.NodeType.TEXT) {
      var text = cur.nodeValue.replace(/(\r\n|\r|\n)/g, '').replace(/ +/g, ' ');
      pos += text.length;
    } else if (cur.nodeName in goog.dom.PREDEFINED_TAG_VALUES_) {
      pos += goog.dom.PREDEFINED_TAG_VALUES_[cur.nodeName].length;
    } else {
      for (var i = cur.childNodes.length - 1; i >= 0; i--) {
        stack.push(cur.childNodes[i]);
      }
    }
  }
  if (goog.isObject(opt_result)) {
    opt_result.remainder = cur ? cur.nodeValue.length + offset - pos - 1 : 0;
    opt_result.node = cur;
  }

  return cur;
};


/**
 * Returns true if the object is a {@code NodeList}.  To qualify as a NodeList,
 * the object must have a numeric length property and an item function (which
 * has type 'string' on IE for some reason).
 * @param {Object} val Object to test.
 * @return {boolean} Whether the object is a NodeList.
 */
goog.dom.isNodeList = function(val) {
  // TODO(attila): Now the isNodeList is part of goog.dom we can use
  // goog.userAgent to make this simpler.
  // A NodeList must have a length property of type 'number' on all platforms.
  if (val && typeof val.length == 'number') {
    // A NodeList is an object everywhere except Safari, where it's a function.
    if (goog.isObject(val)) {
      // A NodeList must have an item function (on non-IE platforms) or an item
      // property of type 'string' (on IE).
      return typeof val.item == 'function' || typeof val.item == 'string';
    } else if (goog.isFunction(val)) {
      // On Safari, a NodeList is a function with an item property that is also
      // a function.
      return typeof val.item == 'function';
    }
  }

  // Not a NodeList.
  return false;
};


/**
 * Walks up the DOM hierarchy returning the first ancestor that has the passed
 * tag name and/or class name. If the passed element matches the specified
 * criteria, the element itself is returned.
 * @param {Node} element The DOM node to start with.
 * @param {?(goog.dom.TagName|string)=} opt_tag The tag name to match (or
 *     null/undefined to match only based on class name).
 * @param {?string=} opt_class The class name to match (or null/undefined to
 *     match only based on tag name).
 * @return {Element} The first ancestor that matches the passed criteria, or
 *     null if no match is found.
 */
goog.dom.getAncestorByTagNameAndClass = function(element, opt_tag, opt_class) {
  if (!opt_tag && !opt_class) {
    return null;
  }
  var tagName = opt_tag ? opt_tag.toUpperCase() : null;
  return /** @type {Element} */ (goog.dom.getAncestor(element,
      function(node) {
        return (!tagName || node.nodeName == tagName) &&
               (!opt_class || goog.dom.classes.has(node, opt_class));
      }, true));
};


/**
 * Walks up the DOM hierarchy returning the first ancestor that has the passed
 * class name. If the passed element matches the specified criteria, the
 * element itself is returned.
 * @param {Node} element The DOM node to start with.
 * @param {string} className The class name to match.
 * @return {Element} The first ancestor that matches the passed criteria, or
 *     null if none match.
 */
goog.dom.getAncestorByClass = function(element, className) {
  return goog.dom.getAncestorByTagNameAndClass(element, null, className);
};


/**
 * Walks up the DOM hierarchy returning the first ancestor that passes the
 * matcher function.
 * @param {Node} element The DOM node to start with.
 * @param {function(Node) : boolean} matcher A function that returns true if the
 *     passed node matches the desired criteria.
 * @param {boolean=} opt_includeNode If true, the node itself is included in
 *     the search (the first call to the matcher will pass startElement as
 *     the node to test).
 * @param {number=} opt_maxSearchSteps Maximum number of levels to search up the
 *     dom.
 * @return {Node} DOM node that matched the matcher, or null if there was
 *     no match.
 */
goog.dom.getAncestor = function(
    element, matcher, opt_includeNode, opt_maxSearchSteps) {
  if (!opt_includeNode) {
    element = element.parentNode;
  }
  var ignoreSearchSteps = opt_maxSearchSteps == null;
  var steps = 0;
  while (element && (ignoreSearchSteps || steps <= opt_maxSearchSteps)) {
    if (matcher(element)) {
      return element;
    }
    element = element.parentNode;
    steps++;
  }
  // Reached the root of the DOM without a match
  return null;
};


/**
 * Determines the active element in the given document.
 * @param {Document} doc The document to look in.
 * @return {Element} The active element.
 */
goog.dom.getActiveElement = function(doc) {
  try {
    return doc && doc.activeElement;
  } catch (e) {
    // NOTE(nicksantos): Sometimes, evaluating document.activeElement in IE
    // throws an exception. I'm not 100% sure why, but I suspect it chokes
    // on document.activeElement if the activeElement has been recently
    // removed from the DOM by a JS operation.
    //
    // We assume that an exception here simply means
    // "there is no active element."
  }

  return null;
};



/**
 * Create an instance of a DOM helper with a new document object.
 * @param {Document=} opt_document Document object to associate with this
 *     DOM helper.
 * @constructor
 */
goog.dom.DomHelper = function(opt_document) {
  /**
   * Reference to the document object to use
   * @type {!Document}
   * @private
   */
  this.document_ = opt_document || goog.global.document || document;
};


/**
 * Gets the dom helper object for the document where the element resides.
 * @param {Node=} opt_node If present, gets the DomHelper for this node.
 * @return {!goog.dom.DomHelper} The DomHelper.
 */
goog.dom.DomHelper.prototype.getDomHelper = goog.dom.getDomHelper;


/**
 * Sets the document object.
 * @param {!Document} document Document object.
 */
goog.dom.DomHelper.prototype.setDocument = function(document) {
  this.document_ = document;
};


/**
 * Gets the document object being used by the dom library.
 * @return {!Document} Document object.
 */
goog.dom.DomHelper.prototype.getDocument = function() {
  return this.document_;
};


/**
 * Alias for {@code getElementById}. If a DOM node is passed in then we just
 * return that.
 * @param {string|Element} element Element ID or a DOM node.
 * @return {Element} The element with the given ID, or the node passed in.
 */
goog.dom.DomHelper.prototype.getElement = function(element) {
  if (goog.isString(element)) {
    return this.document_.getElementById(element);
  } else {
    return element;
  }
};


/**
 * Alias for {@code getElement}.
 * @param {string|Element} element Element ID or a DOM node.
 * @return {Element} The element with the given ID, or the node passed in.
 * @deprecated Use {@link goog.dom.DomHelper.prototype.getElement} instead.
 */
goog.dom.DomHelper.prototype.$ = goog.dom.DomHelper.prototype.getElement;


/**
 * Looks up elements by both tag and class name, using browser native functions
 * ({@code querySelectorAll}, {@code getElementsByTagName} or
 * {@code getElementsByClassName}) where possible. The returned array is a live
 * NodeList or a static list depending on the code path taken.
 *
 * @see goog.dom.query
 *
 * @param {?string=} opt_tag Element tag name or * for all tags.
 * @param {?string=} opt_class Optional class name.
 * @param {(Document|Element)=} opt_el Optional element to look in.
 * @return { {length: number} } Array-like list of elements (only a length
 *     property and numerical indices are guaranteed to exist).
 */
goog.dom.DomHelper.prototype.getElementsByTagNameAndClass = function(opt_tag,
                                                                     opt_class,
                                                                     opt_el) {
  return goog.dom.getElementsByTagNameAndClass_(this.document_, opt_tag,
                                                opt_class, opt_el);
};


/**
 * Returns an array of all the elements with the provided className.
 * @see {goog.dom.query}
 * @param {string} className the name of the class to look for.
 * @param {Element|Document=} opt_el Optional element to look in.
 * @return { {length: number} } The items found with the class name provided.
 */
goog.dom.DomHelper.prototype.getElementsByClass = function(className, opt_el) {
  var doc = opt_el || this.document_;
  return goog.dom.getElementsByClass(className, doc);
};


/**
 * Returns the first element we find matching the provided class name.
 * @see {goog.dom.query}
 * @param {string} className the name of the class to look for.
 * @param {(Element|Document)=} opt_el Optional element to look in.
 * @return {Element} The first item found with the class name provided.
 */
goog.dom.DomHelper.prototype.getElementByClass = function(className, opt_el) {
  var doc = opt_el || this.document_;
  return goog.dom.getElementByClass(className, doc);
};


/**
 * Alias for {@code getElementsByTagNameAndClass}.
 * @deprecated Use DomHelper getElementsByTagNameAndClass.
 * @see goog.dom.query
 *
 * @param {?string=} opt_tag Element tag name.
 * @param {?string=} opt_class Optional class name.
 * @param {Element=} opt_el Optional element to look in.
 * @return { {length: number} } Array-like list of elements (only a length
 *     property and numerical indices are guaranteed to exist).
 */
goog.dom.DomHelper.prototype.$$ =
    goog.dom.DomHelper.prototype.getElementsByTagNameAndClass;


/**
 * Sets a number of properties on a node.
 * @param {Element} element DOM node to set properties on.
 * @param {Object} properties Hash of property:value pairs.
 */
goog.dom.DomHelper.prototype.setProperties = goog.dom.setProperties;


/**
 * Gets the dimensions of the viewport.
 * @param {Window=} opt_window Optional window element to test. Defaults to
 *     the window of the Dom Helper.
 * @return {!goog.math.Size} Object with values 'width' and 'height'.
 */
goog.dom.DomHelper.prototype.getViewportSize = function(opt_window) {
  // TODO(arv): This should not take an argument. That breaks the rule of a
  // a DomHelper representing a single frame/window/document.
  return goog.dom.getViewportSize(opt_window || this.getWindow());
};


/**
 * Calculates the height of the document.
 *
 * @return {number} The height of the document.
 */
goog.dom.DomHelper.prototype.getDocumentHeight = function() {
  return goog.dom.getDocumentHeight_(this.getWindow());
};


/**
 * Typedef for use with goog.dom.createDom and goog.dom.append.
 * @typedef {Object|string|Array|NodeList}
 */
goog.dom.Appendable;


/**
 * Returns a dom node with a set of attributes.  This function accepts varargs
 * for subsequent nodes to be added.  Subsequent nodes will be added to the
 * first node as childNodes.
 *
 * So:
 * <code>createDom('div', null, createDom('p'), createDom('p'));</code>
 * would return a div with two child paragraphs
 *
 * An easy way to move all child nodes of an existing element to a new parent
 * element is:
 * <code>createDom('div', null, oldElement.childNodes);</code>
 * which will remove all child nodes from the old element and add them as
 * child nodes of the new DIV.
 *
 * @param {string} tagName Tag to create.
 * @param {Object|string=} opt_attributes If object, then a map of name-value
 *     pairs for attributes. If a string, then this is the className of the new
 *     element.
 * @param {...goog.dom.Appendable} var_args Further DOM nodes or
 *     strings for text nodes. If one of the var_args is an array or
 *     NodeList, its elements will be added as childNodes instead.
 * @return {!Element} Reference to a DOM node.
 */
goog.dom.DomHelper.prototype.createDom = function(tagName,
                                                  opt_attributes,
                                                  var_args) {
  return goog.dom.createDom_(this.document_, arguments);
};


/**
 * Alias for {@code createDom}.
 * @param {string} tagName Tag to create.
 * @param {(Object|string)=} opt_attributes If object, then a map of name-value
 *     pairs for attributes. If a string, then this is the className of the new
 *     element.
 * @param {...goog.dom.Appendable} var_args Further DOM nodes or strings for
 *     text nodes.  If one of the var_args is an array, its children will be
 *     added as childNodes instead.
 * @return {!Element} Reference to a DOM node.
 * @deprecated Use {@link goog.dom.DomHelper.prototype.createDom} instead.
 */
goog.dom.DomHelper.prototype.$dom = goog.dom.DomHelper.prototype.createDom;


/**
 * Creates a new element.
 * @param {string} name Tag name.
 * @return {!Element} The new element.
 */
goog.dom.DomHelper.prototype.createElement = function(name) {
  return this.document_.createElement(name);
};


/**
 * Creates a new text node.
 * @param {string} content Content.
 * @return {!Text} The new text node.
 */
goog.dom.DomHelper.prototype.createTextNode = function(content) {
  return this.document_.createTextNode(content);
};


/**
 * Create a table.
 * @param {number} rows The number of rows in the table.  Must be >= 1.
 * @param {number} columns The number of columns in the table.  Must be >= 1.
 * @param {boolean=} opt_fillWithNbsp If true, fills table entries with nsbps.
 * @return {!Element} The created table.
 */
goog.dom.DomHelper.prototype.createTable = function(rows, columns,
    opt_fillWithNbsp) {
  return goog.dom.createTable_(this.document_, rows, columns,
      !!opt_fillWithNbsp);
};


/**
 * Converts an HTML string into a node or a document fragment.  A single Node
 * is used if the {@code htmlString} only generates a single node.  If the
 * {@code htmlString} generates multiple nodes then these are put inside a
 * {@code DocumentFragment}.
 *
 * @param {string} htmlString The HTML string to convert.
 * @return {!Node} The resulting node.
 */
goog.dom.DomHelper.prototype.htmlToDocumentFragment = function(htmlString) {
  return goog.dom.htmlToDocumentFragment_(this.document_, htmlString);
};


/**
 * Returns the compatMode of the document.
 * @return {string} The result is either CSS1Compat or BackCompat.
 * @deprecated use goog.dom.DomHelper.prototype.isCss1CompatMode instead.
 */
goog.dom.DomHelper.prototype.getCompatMode = function() {
  return this.isCss1CompatMode() ? 'CSS1Compat' : 'BackCompat';
};


/**
 * Returns true if the browser is in "CSS1-compatible" (standards-compliant)
 * mode, false otherwise.
 * @return {boolean} True if in CSS1-compatible mode.
 */
goog.dom.DomHelper.prototype.isCss1CompatMode = function() {
  return goog.dom.isCss1CompatMode_(this.document_);
};


/**
 * Gets the window object associated with the document.
 * @return {!Window} The window associated with the given document.
 */
goog.dom.DomHelper.prototype.getWindow = function() {
  return goog.dom.getWindow_(this.document_);
};


/**
 * Gets the document scroll element.
 * @return {Element} Scrolling element.
 */
goog.dom.DomHelper.prototype.getDocumentScrollElement = function() {
  return goog.dom.getDocumentScrollElement_(this.document_);
};


/**
 * Gets the document scroll distance as a coordinate object.
 * @return {!goog.math.Coordinate} Object with properties 'x' and 'y'.
 */
goog.dom.DomHelper.prototype.getDocumentScroll = function() {
  return goog.dom.getDocumentScroll_(this.document_);
};


/**
 * Appends a child to a node.
 * @param {Node} parent Parent.
 * @param {Node} child Child.
 */
goog.dom.DomHelper.prototype.appendChild = goog.dom.appendChild;


/**
 * Appends a node with text or other nodes.
 * @param {!Node} parent The node to append nodes to.
 * @param {...goog.dom.Appendable} var_args The things to append to the node.
 *     If this is a Node it is appended as is.
 *     If this is a string then a text node is appended.
 *     If this is an array like object then fields 0 to length - 1 are appended.
 */
goog.dom.DomHelper.prototype.append = goog.dom.append;


/**
 * Removes all the child nodes on a DOM node.
 * @param {Node} node Node to remove children from.
 */
goog.dom.DomHelper.prototype.removeChildren = goog.dom.removeChildren;


/**
 * Inserts a new node before an existing reference node (i.e., as the previous
 * sibling). If the reference node has no parent, then does nothing.
 * @param {Node} newNode Node to insert.
 * @param {Node} refNode Reference node to insert before.
 */
goog.dom.DomHelper.prototype.insertSiblingBefore = goog.dom.insertSiblingBefore;


/**
 * Inserts a new node after an existing reference node (i.e., as the next
 * sibling). If the reference node has no parent, then does nothing.
 * @param {Node} newNode Node to insert.
 * @param {Node} refNode Reference node to insert after.
 */
goog.dom.DomHelper.prototype.insertSiblingAfter = goog.dom.insertSiblingAfter;


/**
 * Removes a node from its parent.
 * @param {Node} node The node to remove.
 * @return {Node} The node removed if removed; else, null.
 */
goog.dom.DomHelper.prototype.removeNode = goog.dom.removeNode;


/**
 * Replaces a node in the DOM tree. Will do nothing if {@code oldNode} has no
 * parent.
 * @param {Node} newNode Node to insert.
 * @param {Node} oldNode Node to replace.
 */
goog.dom.DomHelper.prototype.replaceNode = goog.dom.replaceNode;


/**
 * Flattens an element. That is, removes it and replace it with its children.
 * @param {Element} element The element to flatten.
 * @return {Element|undefined} The original element, detached from the document
 *     tree, sans children, or undefined if the element was already not in the
 *     document.
 */
goog.dom.DomHelper.prototype.flattenElement = goog.dom.flattenElement;


/**
 * Returns the first child node that is an element.
 * @param {Node} node The node to get the first child element of.
 * @return {Element} The first child node of {@code node} that is an element.
 */
goog.dom.DomHelper.prototype.getFirstElementChild =
    goog.dom.getFirstElementChild;


/**
 * Returns the last child node that is an element.
 * @param {Node} node The node to get the last child element of.
 * @return {Element} The last child node of {@code node} that is an element.
 */
goog.dom.DomHelper.prototype.getLastElementChild = goog.dom.getLastElementChild;


/**
 * Returns the first next sibling that is an element.
 * @param {Node} node The node to get the next sibling element of.
 * @return {Element} The next sibling of {@code node} that is an element.
 */
goog.dom.DomHelper.prototype.getNextElementSibling =
    goog.dom.getNextElementSibling;


/**
 * Returns the first previous sibling that is an element.
 * @param {Node} node The node to get the previous sibling element of.
 * @return {Element} The first previous sibling of {@code node} that is
 *     an element.
 */
goog.dom.DomHelper.prototype.getPreviousElementSibling =
    goog.dom.getPreviousElementSibling;


/**
 * Returns the next node in source order from the given node.
 * @param {Node} node The node.
 * @return {Node} The next node in the DOM tree, or null if this was the last
 *     node.
 */
goog.dom.DomHelper.prototype.getNextNode =
    goog.dom.getNextNode;


/**
 * Returns the previous node in source order from the given node.
 * @param {Node} node The node.
 * @return {Node} The previous node in the DOM tree, or null if this was the
 *     first node.
 */
goog.dom.DomHelper.prototype.getPreviousNode =
    goog.dom.getPreviousNode;


/**
 * Whether the object looks like a DOM node.
 * @param {*} obj The object being tested for node likeness.
 * @return {boolean} Whether the object looks like a DOM node.
 */
goog.dom.DomHelper.prototype.isNodeLike = goog.dom.isNodeLike;


/**
 * Whether a node contains another node.
 * @param {Node} parent The node that should contain the other node.
 * @param {Node} descendant The node to test presence of.
 * @return {boolean} Whether the parent node contains the descendent node.
 */
goog.dom.DomHelper.prototype.contains = goog.dom.contains;


/**
 * Returns the owner document for a node.
 * @param {Node} node The node to get the document for.
 * @return {!Document} The document owning the node.
 */
goog.dom.DomHelper.prototype.getOwnerDocument = goog.dom.getOwnerDocument;


/**
 * Cross browser function for getting the document element of an iframe.
 * @param {Element} iframe Iframe element.
 * @return {!Document} The frame content document.
 */
goog.dom.DomHelper.prototype.getFrameContentDocument =
    goog.dom.getFrameContentDocument;


/**
 * Cross browser function for getting the window of a frame or iframe.
 * @param {HTMLIFrameElement|HTMLFrameElement} frame Frame element.
 * @return {Window} The window associated with the given frame.
 */
goog.dom.DomHelper.prototype.getFrameContentWindow =
    goog.dom.getFrameContentWindow;


/**
 * Cross browser function for setting the text content of an element.
 * @param {Element} element The element to change the text content of.
 * @param {string} text The string that should replace the current element
 *     content with.
 */
goog.dom.DomHelper.prototype.setTextContent = goog.dom.setTextContent;


/**
 * Finds the first descendant node that matches the filter function. This does
 * a depth first search.
 * @param {Node} root The root of the tree to search.
 * @param {function(Node) : boolean} p The filter function.
 * @return {Node|undefined} The found node or undefined if none is found.
 */
goog.dom.DomHelper.prototype.findNode = goog.dom.findNode;


/**
 * Finds all the descendant nodes that matches the filter function. This does a
 * depth first search.
 * @param {Node} root The root of the tree to search.
 * @param {function(Node) : boolean} p The filter function.
 * @return {Array.<Node>} The found nodes or an empty array if none are found.
 */
goog.dom.DomHelper.prototype.findNodes = goog.dom.findNodes;


/**
 * Returns the text contents of the current node, without markup. New lines are
 * stripped and whitespace is collapsed, such that each character would be
 * visible.
 *
 * In browsers that support it, innerText is used.  Other browsers attempt to
 * simulate it via node traversal.  Line breaks are canonicalized in IE.
 *
 * @param {Node} node The node from which we are getting content.
 * @return {string} The text content.
 */
goog.dom.DomHelper.prototype.getTextContent = goog.dom.getTextContent;


/**
 * Returns the text length of the text contained in a node, without markup. This
 * is equivalent to the selection length if the node was selected, or the number
 * of cursor movements to traverse the node. Images & BRs take one space.  New
 * lines are ignored.
 *
 * @param {Node} node The node whose text content length is being calculated.
 * @return {number} The length of {@code node}'s text content.
 */
goog.dom.DomHelper.prototype.getNodeTextLength = goog.dom.getNodeTextLength;


/**
 * Returns the text offset of a node relative to one of its ancestors. The text
 * length is the same as the length calculated by
 * {@code goog.dom.getNodeTextLength}.
 *
 * @param {Node} node The node whose offset is being calculated.
 * @param {Node=} opt_offsetParent Defaults to the node's owner document's body.
 * @return {number} The text offset.
 */
goog.dom.DomHelper.prototype.getNodeTextOffset = goog.dom.getNodeTextOffset;


/**
 * Walks up the DOM hierarchy returning the first ancestor that has the passed
 * tag name and/or class name. If the passed element matches the specified
 * criteria, the element itself is returned.
 * @param {Node} element The DOM node to start with.
 * @param {?(goog.dom.TagName|string)=} opt_tag The tag name to match (or
 *     null/undefined to match only based on class name).
 * @param {?string=} opt_class The class name to match (or null/undefined to
 *     match only based on tag name).
 * @return {Element} The first ancestor that matches the passed criteria, or
 *     null if no match is found.
 */
goog.dom.DomHelper.prototype.getAncestorByTagNameAndClass =
    goog.dom.getAncestorByTagNameAndClass;


/**
 * Walks up the DOM hierarchy returning the first ancestor that has the passed
 * class name. If the passed element matches the specified criteria, the
 * element itself is returned.
 * @param {Node} element The DOM node to start with.
 * @param {string} class The class name to match.
 * @return {Element} The first ancestor that matches the passed criteria, or
 *     null if none match.
 */
goog.dom.DomHelper.prototype.getAncestorByClass =
    goog.dom.getAncestorByClass;


/**
 * Walks up the DOM hierarchy returning the first ancestor that passes the
 * matcher function.
 * @param {Node} element The DOM node to start with.
 * @param {function(Node) : boolean} matcher A function that returns true if the
 *     passed node matches the desired criteria.
 * @param {boolean=} opt_includeNode If true, the node itself is included in
 *     the search (the first call to the matcher will pass startElement as
 *     the node to test).
 * @param {number=} opt_maxSearchSteps Maximum number of levels to search up the
 *     dom.
 * @return {Node} DOM node that matched the matcher, or null if there was
 *     no match.
 */
goog.dom.DomHelper.prototype.getAncestor = goog.dom.getAncestor;
/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 10.03.12
 * Time: 13:18
 * To change this template use File | Settings | File Templates.
 */

goog.require("Rendering.Programs_Interface");
goog.provide("Rendering.Programs_Basic");

/**
 * @constructor
 * @implements {Rendering.Programs_Interface}
 * @param {WebGLRenderingContext}
*/
Rendering.Programs_Basic = function(gl) {
    var vshader = gl.createShader(goog.webgl.VERTEX_SHADER);
    gl.shaderSource(vshader,'attribute vec3 aVertexPosition; uniform mat4 MVMatrix; void main(void) { gl_Position = MVMatrix * vec4(aVertexPosition, 1.0);}');
    gl.compileShader(vshader);
    if (!gl.getShaderParameter(vshader, goog.webgl.COMPILE_STATUS)) {
        alert('Error during vertex shader compilation:\n' + gl.getShaderInfoLog(vshader)); return;
    }


    var fshader = gl.createShader(goog.webgl.FRAGMENT_SHADER);
    gl.shaderSource(fshader, 'void main(void){gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);}');
    gl.compileShader(fshader);
    if (!gl.getShaderParameter(fshader, goog.webgl.COMPILE_STATUS)) {
        alert('Error during vertex shader compilation:\n' + gl.getShaderInfoLog(fshader)); return;
    }

    var program = gl.createProgram();
    gl.attachShader(program, fshader);
    gl.attachShader(program, vshader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, goog.webgl.LINK_STATUS)){
        alert("Error during program linking:\n" + gl.getProgramInfoLog(program));
        return;
    }

    // Validates and uses program in the GL context
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, goog.webgl.VALIDATE_STATUS)) {
        alert("Error during program validation:\n" + gl.getProgramInfoLog(program));
        return;
    }
    /**
     * @type {WebGLProgram}
     */
    this.program = program;
    /**
     * @type {Object.<WebGLUniformLocation>}
     */
    this.uniforms=  {
            MVMatrix: gl.getUniformLocation(program, "MVMatrix")
        };
    /**
     * @type {Object.<number>}
     */
    this.attribs = {
            vertexPosition: gl.getAttribLocation(program, 'aVertexPosition')
        };
    gl.enableVertexAttribArray(this.attribs.vertexPosition);
};

/**
 * @param {WebGLRenderingContext}
 * @param {Rendering.Model}
 */
Rendering.Programs_Basic.prototype.draw = function(gl, model) {
    gl.bindBuffer(goog.webgl.ARRAY_BUFFER, model.verticesBuffer);
    gl.vertexAttribPointer(this.attribs.vertexPosition, 3, goog.webgl.FLOAT, false, 0, 0);
    gl.drawArrays(model.verticesType, 0, model.verticesBufferSize);
};/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 09.03.12
 * Time: 23:01
 * To change this template use File | Settings | File Templates.
 */

goog.provide("Rendering.Demos_Demo9");
goog.require('Rendering.Demos_Interface');
goog.require("Rendering.Import.Element_Array");
goog.require("Rendering.Programs_Normal2ColorCameraPosition");
goog.require('Rendering.Model_Cube');


/**
 * @constructor
 * @implements {Rendering.Demos_Interface}
 * @param {WebGLRenderingContext}
    */
Rendering.Demos_Demo9 = function(gl) {
    /*
     * @type {Rendering.Programs_Interface}
     */
    this.program = new Rendering.Programs_Normal2ColorCameraPosition(gl);

    /*
     * @type {Rendering.Model_Cube?}
     */
    this.model = null;

    /**
     *
     * @type {Rendering.Camera}
     */
    this.camera = new Rendering.Camera();
    this.camera.bindPositionToKeyboard();

    /**
     * @type {mat4}
     */
    this.modelView = mat4.create();
    mat4.identity(this.modelView);
};


Rendering.Demos_Demo9.prototype.title = "Cube primitive 1000 instances";
/**
 * @param {WebGLRenderingContext}
    */
Rendering.Demos_Demo9.prototype.run = function(gl) {
    console.log("run demo 9");

    /**
     * @const
     * @type {number}
     */
    this.numberOfCubes = 1000;

    /**
     * @type {Number}
     */
    this.frameNo = 0;

    /**
     * @type {Array.<Rendering.Model_Cube>}
     */
    this.models = [];
    for(var i = 0; i < this.numberOfCubes; i++) {
        this.models[i] = new Rendering.Model_Cube(gl, 0.01);
        this.models[i].position = vec3.create([2*Math.random()-1,2*Math.random()-1,2*Math.random()-1]);
    }

    gl.useProgram(this.program.program);
};

Rendering.Demos_Demo9.prototype.stop = function() {
    console.log("stop demo 9");

    delete this.models;
    delete this.modelView;
    delete this.program;
};
/**
 * @param {WebGLRenderingContext}
    */
Rendering.Demos_Demo9.prototype.frame = function(gl) {
    this.frameNo++;

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniformMatrix4fv(this.program.uniforms.projectionMatrix, false, this.camera.projection);
    gl.uniformMatrix4fv(this.program.uniforms.viewMatrix, false, this.camera.view);

    mat4.rotate(this.modelView, 1.0/180*Math.PI, [0, 0, 1]);
    mat4.rotate(this.modelView, 0.5/180*Math.PI, [0, 1, 0]);
    mat4.rotate(this.modelView, 0.75/180*Math.PI, [1, 0, 0]);

    /**
     * @type {mat4}
     */
    var instanceMV = mat4.identity();

    for(var i = 0; i < this.numberOfCubes; i++) {
        this.models[i].position[0] = Math.sin(Math.PI/180 * (i%1000) * this.frameNo / 20);
        this.models[i].position[1] = Math.cos(Math.PI/180 * (i%1000) * this.frameNo / 20);

        mat4.translate(this.modelView, this.models[i].position, instanceMV);
        gl.uniformMatrix4fv(this.program.uniforms.modelMatrix, false, instanceMV);
        if(this.models[i]) {
            this.program.draw(gl, this.models[i]);
        }
    }
    gl.flush();
};/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 10.03.12
 * Time: 13:18
 * To change this template use File | Settings | File Templates.
 */

goog.require("Rendering.Programs_Interface");
goog.provide("Rendering.Programs_Normal2ColorCamera");

/**
 * @constructor
 * @implements {Rendering.Programs_Interface}
 * @param {WebGLRenderingContext}
 */
Rendering.Programs_Normal2ColorCamera = function(gl) {
    var vshader = gl.createShader(goog.webgl.VERTEX_SHADER);
    gl.shaderSource(vshader,[
        'attribute vec3 aVertexPosition;',
        'attribute vec3 normalPosition;',

        'varying mediump vec4 vVaryingColor;',
        'uniform mat4 viewMatrix;',
        'uniform mat4 projectionMatrix;',
        'uniform mat4 modelMatrix;',

        'void main(void)',
        '{',
            'vVaryingColor = vec4(normalPosition, 1.0);',
            'gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(aVertexPosition, 1.0);',
        '}'].join("\n")
    );
    gl.compileShader(vshader);
    if (!gl.getShaderParameter(vshader, goog.webgl.COMPILE_STATUS)) {
        alert('Error during vertex shader compilation:\n' + gl.getShaderInfoLog(vshader)); return;
    }


    var fshader = gl.createShader(goog.webgl.FRAGMENT_SHADER);
    gl.shaderSource(fshader, [
        'varying mediump vec4 vVaryingColor;',
        'void main(void)',
        '{',
            'gl_FragColor = vVaryingColor;',
        '}'].join("\n"));
    gl.compileShader(fshader);
    if (!gl.getShaderParameter(fshader, goog.webgl.COMPILE_STATUS)) {
        alert('Error during vertex shader compilation:\n' + gl.getShaderInfoLog(fshader)); return;
    }

    var program = gl.createProgram();
    gl.attachShader(program, fshader);
    gl.attachShader(program, vshader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, goog.webgl.LINK_STATUS)){
        alert("Error during program linking:\n" + gl.getProgramInfoLog(program));
        return;
    }

    // Validates and uses program in the GL context
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, goog.webgl.VALIDATE_STATUS)) {
        alert("Error during program validation:\n" + gl.getProgramInfoLog(program));
        return;
    }
    /**
     * @type {WebGLProgram}
     */
    this.program = program;
    /**
     * @type {Object.<WebGLUniformLocation>}
     */
    this.uniforms=  {
            modelMatrix: gl.getUniformLocation(program, "modelMatrix"),
            viewMatrix: gl.getUniformLocation(program, "viewMatrix"),
            projectionMatrix: gl.getUniformLocation(program, "projectionMatrix")
        };
    /**
     * @type {Object.<number>}
     */
    this.attribs = {
            vertexPosition: gl.getAttribLocation(program, 'aVertexPosition'),
            normalPosition: gl.getAttribLocation(program, 'normalPosition')
        };
    gl.enableVertexAttribArray(this.attribs.vertexPosition);
    gl.enableVertexAttribArray(this.attribs.normalPosition);
};
/**
 * @param {WebGLRenderingContext}
 * @param {Rendering.Model}
 */
Rendering.Programs_Normal2ColorCamera.prototype.draw = function(gl, model) {
    gl.bindBuffer(goog.webgl.ARRAY_BUFFER, model.verticesBuffer);
    gl.vertexAttribPointer(this.attribs.vertexPosition, 3, goog.webgl.FLOAT, false, 0, 0);
    gl.bindBuffer(goog.webgl.ARRAY_BUFFER, model.normalsBuffer);
    gl.vertexAttribPointer(this.attribs.normalPosition, 3, goog.webgl.FLOAT, false, 0, 0);
    gl.drawArrays(model.verticesType, 0, model.verticesBufferSize);
};/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 09.03.12
 * Time: 23:01
 * To change this template use File | Settings | File Templates.
 */

goog.provide("Rendering.Demos_Demo8");
goog.require('Rendering.Demos_Interface');
goog.require('Rendering.Programs_Normal2ColorCamera');
goog.require("Rendering.Import.Element_Array");
goog.require('Rendering.Model');


/**
 * @constructor
 * @implements {Rendering.Demos_Interface}
 * @param {WebGLRenderingContext}
*/
Rendering.Demos_Demo8 = function(gl) {
    /**
     * @type {Rendering.Programs_Interface}
     */
    this.program = new Rendering.Programs_Normal2ColorCamera(gl);

    /**
     * @type {?Rendering.Model}
     */
    this.model = null;
    /**
     *
     * @type {Rendering.Camera}
     */
    this.camera = new Rendering.Camera();
    this.camera.bindPositionToKeyboard();

    /**
     * @type {mat4}
     */
    this.modelView = mat4.create();
    mat4.identity(this.modelView);
    mat4.rotate(this.modelView, -Math.PI/2, [1, 0, 0]);
    mat4.scale(this.modelView, [0.1, 0.1, 0.1]);
};

/** * @const
 * @type {string}
 */
Rendering.Demos_Demo8.prototype.title = "Normal2color - Dragon with a camera";
/** * @param {WebGLRenderingContext}
 */
Rendering.Demos_Demo8.prototype.run = function(gl) {
    console.log("run demo 8");

    var that = this;
    var parser = new Rendering.Import.Element_Array();
    parser.load('assets/dragon/dragon_vertices.dat',
        'assets/dragon/dragon_faces.dat',
        function(vertices, normals, uvs) {
            that.model = new Rendering.Model();
            that.model.createVerticesBuffer(gl, vertices);
            if(normals) that.model.createNormalsBuffer(gl, normals);
            if(uvs) that.model.createUVsBuffer(gl, uvs);
        }
    );

    gl.useProgram(this.program.program);
};

Rendering.Demos_Demo8.prototype.stop = function() {
    console.log("stop demo 8");

    delete this.model;
    delete this.program;
};
/** * @param {WebGLRenderingContext}
 */
Rendering.Demos_Demo8.prototype.frame = function(gl) {
    gl.clear(gl.COLOR_BUFFER_BIT);

    mat4.rotate(this.modelView, 1.0/180*Math.PI, [0, 0, 1]);

    gl.uniformMatrix4fv(this.program.uniforms.modelMatrix, false, this.modelView);
    gl.uniformMatrix4fv(this.program.uniforms.projectionMatrix, false, this.camera.projection);
    gl.uniformMatrix4fv(this.program.uniforms.viewMatrix, false, this.camera.view);

    if(this.model) this.program.draw(gl, this.model);
    gl.flush();
};// Copyright 2011 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


/**
 * @fileoverview Constants used by the WebGL rendering, including all of the
 * constants used from the WebGL context.  For example, instead of using
 * context.ARRAY_BUFFER, your code can use
 * goog.webgl.ARRAY_BUFFER. The benefits for doing this include allowing
 * the compiler to optimize your code so that the compiled code does not have to
 * contain large strings to reference these properties, and reducing runtime
 * property access.
 *
 * Values are taken from the WebGL Spec:
 * https://www.khronos.org/registry/webgl/specs/1.0/#WEBGLRENDERINGCONTEXT
 */

goog.provide('goog.webgl');


/**
 * @const
 * @type {number}
 */
goog.webgl.DEPTH_BUFFER_BIT = 0x00000100;


/**
 * @const
 * @type {number}
 */
goog.webgl.STENCIL_BUFFER_BIT = 0x00000400;


/**
 * @const
 * @type {number}
 */
goog.webgl.COLOR_BUFFER_BIT = 0x00004000;


/**
 * @const
 * @type {number}
 */
goog.webgl.POINTS = 0x0000;


/**
 * @const
 * @type {number}
 */
goog.webgl.LINES = 0x0001;


/**
 * @const
 * @type {number}
 */
goog.webgl.LINE_LOOP = 0x0002;


/**
 * @const
 * @type {number}
 */
goog.webgl.LINE_STRIP = 0x0003;


/**
 * @const
 * @type {number}
 */
goog.webgl.TRIANGLES = 0x0004;


/**
 * @const
 * @type {number}
 */
goog.webgl.TRIANGLE_STRIP = 0x0005;


/**
 * @const
 * @type {number}
 */
goog.webgl.TRIANGLE_FAN = 0x0006;


/**
 * @const
 * @type {number}
 */
goog.webgl.ZERO = 0;


/**
 * @const
 * @type {number}
 */
goog.webgl.ONE = 1;


/**
 * @const
 * @type {number}
 */
goog.webgl.SRC_COLOR = 0x0300;


/**
 * @const
 * @type {number}
 */
goog.webgl.ONE_MINUS_SRC_COLOR = 0x0301;


/**
 * @const
 * @type {number}
 */
goog.webgl.SRC_ALPHA = 0x0302;


/**
 * @const
 * @type {number}
 */
goog.webgl.ONE_MINUS_SRC_ALPHA = 0x0303;


/**
 * @const
 * @type {number}
 */
goog.webgl.DST_ALPHA = 0x0304;


/**
 * @const
 * @type {number}
 */
goog.webgl.ONE_MINUS_DST_ALPHA = 0x0305;


/**
 * @const
 * @type {number}
 */
goog.webgl.DST_COLOR = 0x0306;


/**
 * @const
 * @type {number}
 */
goog.webgl.ONE_MINUS_DST_COLOR = 0x0307;


/**
 * @const
 * @type {number}
 */
goog.webgl.SRC_ALPHA_SATURATE = 0x0308;


/**
 * @const
 * @type {number}
 */
goog.webgl.FUNC_ADD = 0x8006;


/**
 * @const
 * @type {number}
 */
goog.webgl.BLEND_EQUATION = 0x8009;


/**
 * Same as BLEND_EQUATION
 * @const
 * @type {number}
 */
goog.webgl.BLEND_EQUATION_RGB = 0x8009;


/**
 * @const
 * @type {number}
 */
goog.webgl.BLEND_EQUATION_ALPHA = 0x883D;


/**
 * @const
 * @type {number}
 */
goog.webgl.FUNC_SUBTRACT = 0x800A;


/**
 * @const
 * @type {number}
 */
goog.webgl.FUNC_REVERSE_SUBTRACT = 0x800B;


/**
 * @const
 * @type {number}
 */
goog.webgl.BLEND_DST_RGB = 0x80C8;


/**
 * @const
 * @type {number}
 */
goog.webgl.BLEND_SRC_RGB = 0x80C9;


/**
 * @const
 * @type {number}
 */
goog.webgl.BLEND_DST_ALPHA = 0x80CA;


/**
 * @const
 * @type {number}
 */
goog.webgl.BLEND_SRC_ALPHA = 0x80CB;


/**
 * @const
 * @type {number}
 */
goog.webgl.CONSTANT_COLOR = 0x8001;


/**
 * @const
 * @type {number}
 */
goog.webgl.ONE_MINUS_CONSTANT_COLOR = 0x8002;


/**
 * @const
 * @type {number}
 */
goog.webgl.CONSTANT_ALPHA = 0x8003;


/**
 * @const
 * @type {number}
 */
goog.webgl.ONE_MINUS_CONSTANT_ALPHA = 0x8004;


/**
 * @const
 * @type {number}
 */
goog.webgl.BLEND_COLOR = 0x8005;


/**
 * @const
 * @type {number}
 */
goog.webgl.ARRAY_BUFFER = 0x8892;


/**
 * @const
 * @type {number}
 */
goog.webgl.ELEMENT_ARRAY_BUFFER = 0x8893;


/**
 * @const
 * @type {number}
 */
goog.webgl.ARRAY_BUFFER_BINDING = 0x8894;


/**
 * @const
 * @type {number}
 */
goog.webgl.ELEMENT_ARRAY_BUFFER_BINDING = 0x8895;


/**
 * @const
 * @type {number}
 */
goog.webgl.STREAM_DRAW = 0x88E0;


/**
 * @const
 * @type {number}
 */
goog.webgl.STATIC_DRAW = 0x88E4;


/**
 * @const
 * @type {number}
 */
goog.webgl.DYNAMIC_DRAW = 0x88E8;


/**
 * @const
 * @type {number}
 */
goog.webgl.BUFFER_SIZE = 0x8764;


/**
 * @const
 * @type {number}
 */
goog.webgl.BUFFER_USAGE = 0x8765;


/**
 * @const
 * @type {number}
 */
goog.webgl.CURRENT_VERTEX_ATTRIB = 0x8626;


/**
 * @const
 * @type {number}
 */
goog.webgl.FRONT = 0x0404;


/**
 * @const
 * @type {number}
 */
goog.webgl.BACK = 0x0405;


/**
 * @const
 * @type {number}
 */
goog.webgl.FRONT_AND_BACK = 0x0408;


/**
 * @const
 * @type {number}
 */
goog.webgl.CULL_FACE = 0x0B44;


/**
 * @const
 * @type {number}
 */
goog.webgl.BLEND = 0x0BE2;


/**
 * @const
 * @type {number}
 */
goog.webgl.DITHER = 0x0BD0;


/**
 * @const
 * @type {number}
 */
goog.webgl.STENCIL_TEST = 0x0B90;


/**
 * @const
 * @type {number}
 */
goog.webgl.DEPTH_TEST = 0x0B71;


/**
 * @const
 * @type {number}
 */
goog.webgl.SCISSOR_TEST = 0x0C11;


/**
 * @const
 * @type {number}
 */
goog.webgl.POLYGON_OFFSET_FILL = 0x8037;


/**
 * @const
 * @type {number}
 */
goog.webgl.SAMPLE_ALPHA_TO_COVERAGE = 0x809E;


/**
 * @const
 * @type {number}
 */
goog.webgl.SAMPLE_COVERAGE = 0x80A0;


/**
 * @const
 * @type {number}
 */
goog.webgl.NO_ERROR = 0;


/**
 * @const
 * @type {number}
 */
goog.webgl.INVALID_ENUM = 0x0500;


/**
 * @const
 * @type {number}
 */
goog.webgl.INVALID_VALUE = 0x0501;


/**
 * @const
 * @type {number}
 */
goog.webgl.INVALID_OPERATION = 0x0502;


/**
 * @const
 * @type {number}
 */
goog.webgl.OUT_OF_MEMORY = 0x0505;


/**
 * @const
 * @type {number}
 */
goog.webgl.CW = 0x0900;


/**
 * @const
 * @type {number}
 */
goog.webgl.CCW = 0x0901;


/**
 * @const
 * @type {number}
 */
goog.webgl.LINE_WIDTH = 0x0B21;


/**
 * @const
 * @type {number}
 */
goog.webgl.ALIASED_POINT_SIZE_RANGE = 0x846D;


/**
 * @const
 * @type {number}
 */
goog.webgl.ALIASED_LINE_WIDTH_RANGE = 0x846E;


/**
 * @const
 * @type {number}
 */
goog.webgl.CULL_FACE_MODE = 0x0B45;


/**
 * @const
 * @type {number}
 */
goog.webgl.FRONT_FACE = 0x0B46;


/**
 * @const
 * @type {number}
 */
goog.webgl.DEPTH_RANGE = 0x0B70;


/**
 * @const
 * @type {number}
 */
goog.webgl.DEPTH_WRITEMASK = 0x0B72;


/**
 * @const
 * @type {number}
 */
goog.webgl.DEPTH_CLEAR_VALUE = 0x0B73;


/**
 * @const
 * @type {number}
 */
goog.webgl.DEPTH_FUNC = 0x0B74;


/**
 * @const
 * @type {number}
 */
goog.webgl.STENCIL_CLEAR_VALUE = 0x0B91;


/**
 * @const
 * @type {number}
 */
goog.webgl.STENCIL_FUNC = 0x0B92;


/**
 * @const
 * @type {number}
 */
goog.webgl.STENCIL_FAIL = 0x0B94;


/**
 * @const
 * @type {number}
 */
goog.webgl.STENCIL_PASS_DEPTH_FAIL = 0x0B95;


/**
 * @const
 * @type {number}
 */
goog.webgl.STENCIL_PASS_DEPTH_PASS = 0x0B96;


/**
 * @const
 * @type {number}
 */
goog.webgl.STENCIL_REF = 0x0B97;


/**
 * @const
 * @type {number}
 */
goog.webgl.STENCIL_VALUE_MASK = 0x0B93;


/**
 * @const
 * @type {number}
 */
goog.webgl.STENCIL_WRITEMASK = 0x0B98;


/**
 * @const
 * @type {number}
 */
goog.webgl.STENCIL_BACK_FUNC = 0x8800;


/**
 * @const
 * @type {number}
 */
goog.webgl.STENCIL_BACK_FAIL = 0x8801;


/**
 * @const
 * @type {number}
 */
goog.webgl.STENCIL_BACK_PASS_DEPTH_FAIL = 0x8802;


/**
 * @const
 * @type {number}
 */
goog.webgl.STENCIL_BACK_PASS_DEPTH_PASS = 0x8803;


/**
 * @const
 * @type {number}
 */
goog.webgl.STENCIL_BACK_REF = 0x8CA3;


/**
 * @const
 * @type {number}
 */
goog.webgl.STENCIL_BACK_VALUE_MASK = 0x8CA4;


/**
 * @const
 * @type {number}
 */
goog.webgl.STENCIL_BACK_WRITEMASK = 0x8CA5;


/**
 * @const
 * @type {number}
 */
goog.webgl.VIEWPORT = 0x0BA2;


/**
 * @const
 * @type {number}
 */
goog.webgl.SCISSOR_BOX = 0x0C10;


/**
 * @const
 * @type {number}
 */
goog.webgl.COLOR_CLEAR_VALUE = 0x0C22;


/**
 * @const
 * @type {number}
 */
goog.webgl.COLOR_WRITEMASK = 0x0C23;


/**
 * @const
 * @type {number}
 */
goog.webgl.UNPACK_ALIGNMENT = 0x0CF5;


/**
 * @const
 * @type {number}
 */
goog.webgl.PACK_ALIGNMENT = 0x0D05;


/**
 * @const
 * @type {number}
 */
goog.webgl.MAX_TEXTURE_SIZE = 0x0D33;


/**
 * @const
 * @type {number}
 */
goog.webgl.MAX_VIEWPORT_DIMS = 0x0D3A;


/**
 * @const
 * @type {number}
 */
goog.webgl.SUBPIXEL_BITS = 0x0D50;


/**
 * @const
 * @type {number}
 */
goog.webgl.RED_BITS = 0x0D52;


/**
 * @const
 * @type {number}
 */
goog.webgl.GREEN_BITS = 0x0D53;


/**
 * @const
 * @type {number}
 */
goog.webgl.BLUE_BITS = 0x0D54;


/**
 * @const
 * @type {number}
 */
goog.webgl.ALPHA_BITS = 0x0D55;


/**
 * @const
 * @type {number}
 */
goog.webgl.DEPTH_BITS = 0x0D56;


/**
 * @const
 * @type {number}
 */
goog.webgl.STENCIL_BITS = 0x0D57;


/**
 * @const
 * @type {number}
 */
goog.webgl.POLYGON_OFFSET_UNITS = 0x2A00;


/**
 * @const
 * @type {number}
 */
goog.webgl.POLYGON_OFFSET_FACTOR = 0x8038;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE_BINDING_2D = 0x8069;


/**
 * @const
 * @type {number}
 */
goog.webgl.SAMPLE_BUFFERS = 0x80A8;


/**
 * @const
 * @type {number}
 */
goog.webgl.SAMPLES = 0x80A9;


/**
 * @const
 * @type {number}
 */
goog.webgl.SAMPLE_COVERAGE_VALUE = 0x80AA;


/**
 * @const
 * @type {number}
 */
goog.webgl.SAMPLE_COVERAGE_INVERT = 0x80AB;


/**
 * @const
 * @type {number}
 */
goog.webgl.NUM_COMPRESSED_TEXTURE_FORMATS = 0x86A2;


/**
 * @const
 * @type {number}
 */
goog.webgl.COMPRESSED_TEXTURE_FORMATS = 0x86A3;


/**
 * @const
 * @type {number}
 */
goog.webgl.DONT_CARE = 0x1100;


/**
 * @const
 * @type {number}
 */
goog.webgl.FASTEST = 0x1101;


/**
 * @const
 * @type {number}
 */
goog.webgl.NICEST = 0x1102;


/**
 * @const
 * @type {number}
 */
goog.webgl.GENERATE_MIPMAP_HINT = 0x8192;


/**
 * @const
 * @type {number}
 */
goog.webgl.BYTE = 0x1400;


/**
 * @const
 * @type {number}
 */
goog.webgl.UNSIGNED_BYTE = 0x1401;


/**
 * @const
 * @type {number}
 */
goog.webgl.SHORT = 0x1402;


/**
 * @const
 * @type {number}
 */
goog.webgl.UNSIGNED_SHORT = 0x1403;


/**
 * @const
 * @type {number}
 */
goog.webgl.INT = 0x1404;


/**
 * @const
 * @type {number}
 */
goog.webgl.UNSIGNED_INT = 0x1405;


/**
 * @const
 * @type {number}
 */
goog.webgl.FLOAT = 0x1406;


/**
 * @const
 * @type {number}
 */
goog.webgl.DEPTH_COMPONENT = 0x1902;


/**
 * @const
 * @type {number}
 */
goog.webgl.ALPHA = 0x1906;


/**
 * @const
 * @type {number}
 */
goog.webgl.RGB = 0x1907;


/**
 * @const
 * @type {number}
 */
goog.webgl.RGBA = 0x1908;


/**
 * @const
 * @type {number}
 */
goog.webgl.LUMINANCE = 0x1909;


/**
 * @const
 * @type {number}
 */
goog.webgl.LUMINANCE_ALPHA = 0x190A;


/**
 * @const
 * @type {number}
 */
goog.webgl.UNSIGNED_SHORT_4_4_4_4 = 0x8033;


/**
 * @const
 * @type {number}
 */
goog.webgl.UNSIGNED_SHORT_5_5_5_1 = 0x8034;


/**
 * @const
 * @type {number}
 */
goog.webgl.UNSIGNED_SHORT_5_6_5 = 0x8363;


/**
 * @const
 * @type {number}
 */
goog.webgl.FRAGMENT_SHADER = 0x8B30;


/**
 * @const
 * @type {number}
 */
goog.webgl.VERTEX_SHADER = 0x8B31;


/**
 * @const
 * @type {number}
 */
goog.webgl.MAX_VERTEX_ATTRIBS = 0x8869;


/**
 * @const
 * @type {number}
 */
goog.webgl.MAX_VERTEX_UNIFORM_VECTORS = 0x8DFB;


/**
 * @const
 * @type {number}
 */
goog.webgl.MAX_VARYING_VECTORS = 0x8DFC;


/**
 * @const
 * @type {number}
 */
goog.webgl.MAX_COMBINED_TEXTURE_IMAGE_UNITS = 0x8B4D;


/**
 * @const
 * @type {number}
 */
goog.webgl.MAX_VERTEX_TEXTURE_IMAGE_UNITS = 0x8B4C;


/**
 * @const
 * @type {number}
 */
goog.webgl.MAX_TEXTURE_IMAGE_UNITS = 0x8872;


/**
 * @const
 * @type {number}
 */
goog.webgl.MAX_FRAGMENT_UNIFORM_VECTORS = 0x8DFD;


/**
 * @const
 * @type {number}
 */
goog.webgl.SHADER_TYPE = 0x8B4F;


/**
 * @const
 * @type {number}
 */
goog.webgl.DELETE_STATUS = 0x8B80;


/**
 * @const
 * @type {number}
 */
goog.webgl.LINK_STATUS = 0x8B82;


/**
 * @const
 * @type {number}
 */
goog.webgl.VALIDATE_STATUS = 0x8B83;


/**
 * @const
 * @type {number}
 */
goog.webgl.ATTACHED_SHADERS = 0x8B85;


/**
 * @const
 * @type {number}
 */
goog.webgl.ACTIVE_UNIFORMS = 0x8B86;


/**
 * @const
 * @type {number}
 */
goog.webgl.ACTIVE_ATTRIBUTES = 0x8B89;


/**
 * @const
 * @type {number}
 */
goog.webgl.SHADING_LANGUAGE_VERSION = 0x8B8C;


/**
 * @const
 * @type {number}
 */
goog.webgl.CURRENT_PROGRAM = 0x8B8D;


/**
 * @const
 * @type {number}
 */
goog.webgl.NEVER = 0x0200;


/**
 * @const
 * @type {number}
 */
goog.webgl.LESS = 0x0201;


/**
 * @const
 * @type {number}
 */
goog.webgl.EQUAL = 0x0202;


/**
 * @const
 * @type {number}
 */
goog.webgl.LEQUAL = 0x0203;


/**
 * @const
 * @type {number}
 */
goog.webgl.GREATER = 0x0204;


/**
 * @const
 * @type {number}
 */
goog.webgl.NOTEQUAL = 0x0205;


/**
 * @const
 * @type {number}
 */
goog.webgl.GEQUAL = 0x0206;


/**
 * @const
 * @type {number}
 */
goog.webgl.ALWAYS = 0x0207;


/**
 * @const
 * @type {number}
 */
goog.webgl.KEEP = 0x1E00;


/**
 * @const
 * @type {number}
 */
goog.webgl.REPLACE = 0x1E01;


/**
 * @const
 * @type {number}
 */
goog.webgl.INCR = 0x1E02;


/**
 * @const
 * @type {number}
 */
goog.webgl.DECR = 0x1E03;


/**
 * @const
 * @type {number}
 */
goog.webgl.INVERT = 0x150A;


/**
 * @const
 * @type {number}
 */
goog.webgl.INCR_WRAP = 0x8507;


/**
 * @const
 * @type {number}
 */
goog.webgl.DECR_WRAP = 0x8508;


/**
 * @const
 * @type {number}
 */
goog.webgl.VENDOR = 0x1F00;


/**
 * @const
 * @type {number}
 */
goog.webgl.RENDERER = 0x1F01;


/**
 * @const
 * @type {number}
 */
goog.webgl.VERSION = 0x1F02;


/**
 * @const
 * @type {number}
 */
goog.webgl.NEAREST = 0x2600;


/**
 * @const
 * @type {number}
 */
goog.webgl.LINEAR = 0x2601;


/**
 * @const
 * @type {number}
 */
goog.webgl.NEAREST_MIPMAP_NEAREST = 0x2700;


/**
 * @const
 * @type {number}
 */
goog.webgl.LINEAR_MIPMAP_NEAREST = 0x2701;


/**
 * @const
 * @type {number}
 */
goog.webgl.NEAREST_MIPMAP_LINEAR = 0x2702;


/**
 * @const
 * @type {number}
 */
goog.webgl.LINEAR_MIPMAP_LINEAR = 0x2703;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE_MAG_FILTER = 0x2800;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE_MIN_FILTER = 0x2801;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE_WRAP_S = 0x2802;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE_WRAP_T = 0x2803;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE_2D = 0x0DE1;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE = 0x1702;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE_CUBE_MAP = 0x8513;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE_BINDING_CUBE_MAP = 0x8514;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE_CUBE_MAP_POSITIVE_X = 0x8515;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE_CUBE_MAP_NEGATIVE_X = 0x8516;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE_CUBE_MAP_POSITIVE_Y = 0x8517;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE_CUBE_MAP_NEGATIVE_Y = 0x8518;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE_CUBE_MAP_POSITIVE_Z = 0x8519;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE_CUBE_MAP_NEGATIVE_Z = 0x851A;


/**
 * @const
 * @type {number}
 */
goog.webgl.MAX_CUBE_MAP_TEXTURE_SIZE = 0x851C;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE0 = 0x84C0;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE1 = 0x84C1;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE2 = 0x84C2;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE3 = 0x84C3;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE4 = 0x84C4;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE5 = 0x84C5;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE6 = 0x84C6;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE7 = 0x84C7;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE8 = 0x84C8;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE9 = 0x84C9;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE10 = 0x84CA;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE11 = 0x84CB;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE12 = 0x84CC;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE13 = 0x84CD;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE14 = 0x84CE;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE15 = 0x84CF;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE16 = 0x84D0;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE17 = 0x84D1;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE18 = 0x84D2;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE19 = 0x84D3;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE20 = 0x84D4;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE21 = 0x84D5;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE22 = 0x84D6;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE23 = 0x84D7;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE24 = 0x84D8;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE25 = 0x84D9;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE26 = 0x84DA;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE27 = 0x84DB;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE28 = 0x84DC;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE29 = 0x84DD;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE30 = 0x84DE;


/**
 * @const
 * @type {number}
 */
goog.webgl.TEXTURE31 = 0x84DF;


/**
 * @const
 * @type {number}
 */
goog.webgl.ACTIVE_TEXTURE = 0x84E0;


/**
 * @const
 * @type {number}
 */
goog.webgl.REPEAT = 0x2901;


/**
 * @const
 * @type {number}
 */
goog.webgl.CLAMP_TO_EDGE = 0x812F;


/**
 * @const
 * @type {number}
 */
goog.webgl.MIRRORED_REPEAT = 0x8370;


/**
 * @const
 * @type {number}
 */
goog.webgl.FLOAT_VEC2 = 0x8B50;


/**
 * @const
 * @type {number}
 */
goog.webgl.FLOAT_VEC3 = 0x8B51;


/**
 * @const
 * @type {number}
 */
goog.webgl.FLOAT_VEC4 = 0x8B52;


/**
 * @const
 * @type {number}
 */
goog.webgl.INT_VEC2 = 0x8B53;


/**
 * @const
 * @type {number}
 */
goog.webgl.INT_VEC3 = 0x8B54;


/**
 * @const
 * @type {number}
 */
goog.webgl.INT_VEC4 = 0x8B55;


/**
 * @const
 * @type {number}
 */
goog.webgl.BOOL = 0x8B56;


/**
 * @const
 * @type {number}
 */
goog.webgl.BOOL_VEC2 = 0x8B57;


/**
 * @const
 * @type {number}
 */
goog.webgl.BOOL_VEC3 = 0x8B58;


/**
 * @const
 * @type {number}
 */
goog.webgl.BOOL_VEC4 = 0x8B59;


/**
 * @const
 * @type {number}
 */
goog.webgl.FLOAT_MAT2 = 0x8B5A;


/**
 * @const
 * @type {number}
 */
goog.webgl.FLOAT_MAT3 = 0x8B5B;


/**
 * @const
 * @type {number}
 */
goog.webgl.FLOAT_MAT4 = 0x8B5C;


/**
 * @const
 * @type {number}
 */
goog.webgl.SAMPLER_2D = 0x8B5E;


/**
 * @const
 * @type {number}
 */
goog.webgl.SAMPLER_CUBE = 0x8B60;


/**
 * @const
 * @type {number}
 */
goog.webgl.VERTEX_ATTRIB_ARRAY_ENABLED = 0x8622;


/**
 * @const
 * @type {number}
 */
goog.webgl.VERTEX_ATTRIB_ARRAY_SIZE = 0x8623;


/**
 * @const
 * @type {number}
 */
goog.webgl.VERTEX_ATTRIB_ARRAY_STRIDE = 0x8624;


/**
 * @const
 * @type {number}
 */
goog.webgl.VERTEX_ATTRIB_ARRAY_TYPE = 0x8625;


/**
 * @const
 * @type {number}
 */
goog.webgl.VERTEX_ATTRIB_ARRAY_NORMALIZED = 0x886A;


/**
 * @const
 * @type {number}
 */
goog.webgl.VERTEX_ATTRIB_ARRAY_POINTER = 0x8645;


/**
 * @const
 * @type {number}
 */
goog.webgl.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING = 0x889F;


/**
 * @const
 * @type {number}
 */
goog.webgl.COMPILE_STATUS = 0x8B81;


/**
 * @const
 * @type {number}
 */
goog.webgl.LOW_FLOAT = 0x8DF0;


/**
 * @const
 * @type {number}
 */
goog.webgl.MEDIUM_FLOAT = 0x8DF1;


/**
 * @const
 * @type {number}
 */
goog.webgl.HIGH_FLOAT = 0x8DF2;


/**
 * @const
 * @type {number}
 */
goog.webgl.LOW_INT = 0x8DF3;


/**
 * @const
 * @type {number}
 */
goog.webgl.MEDIUM_INT = 0x8DF4;


/**
 * @const
 * @type {number}
 */
goog.webgl.HIGH_INT = 0x8DF5;


/**
 * @const
 * @type {number}
 */
goog.webgl.FRAMEBUFFER = 0x8D40;


/**
 * @const
 * @type {number}
 */
goog.webgl.RENDERBUFFER = 0x8D41;


/**
 * @const
 * @type {number}
 */
goog.webgl.RGBA4 = 0x8056;


/**
 * @const
 * @type {number}
 */
goog.webgl.RGB5_A1 = 0x8057;


/**
 * @const
 * @type {number}
 */
goog.webgl.RGB565 = 0x8D62;


/**
 * @const
 * @type {number}
 */
goog.webgl.DEPTH_COMPONENT16 = 0x81A5;


/**
 * @const
 * @type {number}
 */
goog.webgl.STENCIL_INDEX = 0x1901;


/**
 * @const
 * @type {number}
 */
goog.webgl.STENCIL_INDEX8 = 0x8D48;


/**
 * @const
 * @type {number}
 */
goog.webgl.DEPTH_STENCIL = 0x84F9;


/**
 * @const
 * @type {number}
 */
goog.webgl.RENDERBUFFER_WIDTH = 0x8D42;


/**
 * @const
 * @type {number}
 */
goog.webgl.RENDERBUFFER_HEIGHT = 0x8D43;


/**
 * @const
 * @type {number}
 */
goog.webgl.RENDERBUFFER_INTERNAL_FORMAT = 0x8D44;


/**
 * @const
 * @type {number}
 */
goog.webgl.RENDERBUFFER_RED_SIZE = 0x8D50;


/**
 * @const
 * @type {number}
 */
goog.webgl.RENDERBUFFER_GREEN_SIZE = 0x8D51;


/**
 * @const
 * @type {number}
 */
goog.webgl.RENDERBUFFER_BLUE_SIZE = 0x8D52;


/**
 * @const
 * @type {number}
 */
goog.webgl.RENDERBUFFER_ALPHA_SIZE = 0x8D53;


/**
 * @const
 * @type {number}
 */
goog.webgl.RENDERBUFFER_DEPTH_SIZE = 0x8D54;


/**
 * @const
 * @type {number}
 */
goog.webgl.RENDERBUFFER_STENCIL_SIZE = 0x8D55;


/**
 * @const
 * @type {number}
 */
goog.webgl.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE = 0x8CD0;


/**
 * @const
 * @type {number}
 */
goog.webgl.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME = 0x8CD1;


/**
 * @const
 * @type {number}
 */
goog.webgl.FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL = 0x8CD2;


/**
 * @const
 * @type {number}
 */
goog.webgl.FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE = 0x8CD3;


/**
 * @const
 * @type {number}
 */
goog.webgl.COLOR_ATTACHMENT0 = 0x8CE0;


/**
 * @const
 * @type {number}
 */
goog.webgl.DEPTH_ATTACHMENT = 0x8D00;


/**
 * @const
 * @type {number}
 */
goog.webgl.STENCIL_ATTACHMENT = 0x8D20;


/**
 * @const
 * @type {number}
 */
goog.webgl.DEPTH_STENCIL_ATTACHMENT = 0x821A;


/**
 * @const
 * @type {number}
 */
goog.webgl.NONE = 0;


/**
 * @const
 * @type {number}
 */
goog.webgl.FRAMEBUFFER_COMPLETE = 0x8CD5;


/**
 * @const
 * @type {number}
 */
goog.webgl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT = 0x8CD6;


/**
 * @const
 * @type {number}
 */
goog.webgl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT = 0x8CD7;


/**
 * @const
 * @type {number}
 */
goog.webgl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS = 0x8CD9;


/**
 * @const
 * @type {number}
 */
goog.webgl.FRAMEBUFFER_UNSUPPORTED = 0x8CDD;


/**
 * @const
 * @type {number}
 */
goog.webgl.FRAMEBUFFER_BINDING = 0x8CA6;


/**
 * @const
 * @type {number}
 */
goog.webgl.RENDERBUFFER_BINDING = 0x8CA7;


/**
 * @const
 * @type {number}
 */
goog.webgl.MAX_RENDERBUFFER_SIZE = 0x84E8;


/**
 * @const
 * @type {number}
 */
goog.webgl.INVALID_FRAMEBUFFER_OPERATION = 0x0506;


/**
 * @const
 * @type {number}
 */
goog.webgl.UNPACK_FLIP_Y_WEBGL = 0x9240;


/**
 * @const
 * @type {number}
 */
goog.webgl.UNPACK_PREMULTIPLY_ALPHA_WEBGL = 0x9241;


/**
 * @const
 * @type {number}
 */
goog.webgl.CONTEXT_LOST_WEBGL = 0x9242;


/**
 * @const
 * @type {number}
 */
goog.webgl.UNPACK_COLORSPACE_CONVERSION_WEBGL = 0x9243;


/**
 * @const
 * @type {number}
 */
goog.webgl.BROWSER_DEFAULT_WEBGL = 0x9244;


/**
 * From the OES_texture_half_float extension.
 * http://www.khronos.org/registry/webgl/extensions/OES_texture_half_float/
 * @const
 * @type {number}
 */
goog.webgl.HALF_FLOAT_OES = 0x8D61;


/**
 * From the OES_standard_derivatives extension.
 * http://www.khronos.org/registry/webgl/extensions/OES_standard_derivatives/
 * @const
 * @type {number}
 */
goog.webgl.FRAGMENT_SHADER_DERIVATIVE_HINT_OES = 0x8B8B;


/**
 * From the OES_vertex_array_object extension.
 * http://www.khronos.org/registry/webgl/extensions/OES_vertex_array_object/
 * @const
 * @type {number}
 */
goog.webgl.VERTEX_ARRAY_BINDING_OES = 0x85B5;


/**
 * From the WEBGL_debug_renderer_info extension.
 * http://www.khronos.org/registry/webgl/extensions/WEBGL_debug_renderer_info/
 * @const
 * @type {number}
 */
goog.webgl.UNMASKED_VENDOR_WEBGL = 0x9245;


/**
 * From the WEBGL_debug_renderer_info extension.
 * http://www.khronos.org/registry/webgl/extensions/WEBGL_debug_renderer_info/
 * @const
 * @type {number}
 */
goog.webgl.UNMASKED_RENDERER_WEBGL = 0x9246;


/**
 * From the WEBGL_compressed_texture_s3tc extension.
 * http://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_s3tc/
 * @const
 * @type {number}
 */
goog.webgl.COMPRESSED_RGB_S3TC_DXT1_EXT = 0x83F0;


/**
 * From the WEBGL_compressed_texture_s3tc extension.
 * http://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_s3tc/
 * @const
 * @type {number}
 */
goog.webgl.COMPRESSED_RGBA_S3TC_DXT1_EXT = 0x83F1;


/**
 * From the WEBGL_compressed_texture_s3tc extension.
 * http://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_s3tc/
 * @const
 * @type {number}
 */
goog.webgl.COMPRESSED_RGBA_S3TC_DXT3_EXT = 0x83F2;


/**
 * From the WEBGL_compressed_texture_s3tc extension.
 * http://www.khronos.org/registry/webgl/extensions/WEBGL_compressed_texture_s3tc/
 * @const
 * @type {number}
 */
goog.webgl.COMPRESSED_RGBA_S3TC_DXT5_EXT = 0x83F3;
/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 09.03.12
 * Time: 23:01
 * To change this template use File | Settings | File Templates.
 */

goog.provide("Rendering.Demos_Demo1");
goog.require('Rendering.Demos_Interface');

goog.require("Rendering.Import.Element_Array");
goog.require("Rendering.Programs_Normal2Color");
goog.require('Rendering.Model');

/**
 * @constructor
 * @implements {Rendering.Demos_Interface}
 * @param {WebGLRenderingContext}
 */
Rendering.Demos_Demo1 = function(gl) {
    /**
     * @type {Rendering.Programs_Interface}
     */
    this.program = new Rendering.Programs_Normal2Color(gl);

    /**
    * @type {number}
     */
    this.rotX = 30;
    /**
     * @type {number}
     */
    this.rotY = 30;
    /**
     * @type {number}
     */
    this.rotZ = 0;
    /**
    * @type {?Rendering.Model}
     */
    this.model = null;
};

/**
 * @const
 * @type {string}
 */
Rendering.Demos_Demo1.prototype.title = "Normal2color T-Rex";

/**
* @param {WebGLRenderingContext}
 */
Rendering.Demos_Demo1.prototype.run = function(gl) {
    console.log("run demo 1");

    var that = this;
    var parser = new Rendering.Import.Element_Array();
    parser.load('assets/tyrannosaurus_rex/tyrannosaurus_rex_vertices.dat',
        'assets/tyrannosaurus_rex/tyrannosaurus_rex_faces.dat',
        function(vertices, normals, uvs) {
            that.model = new Rendering.Model();
            that.model.createVerticesBuffer(gl, vertices);
            if(normals) that.model.createNormalsBuffer(gl, normals);
            if(uvs) that.model.createUVsBuffer(gl, uvs);
        }
    );

    gl.useProgram(this.program.program);
};

Rendering.Demos_Demo1.prototype.stop = function() {
    console.log("stop demo 1");
    delete this.program;
    delete this.model;
};

/**
 * @param {WebGLRenderingContext}
 */
Rendering.Demos_Demo1.prototype.frame = function(gl) {
    gl.clear(gl.COLOR_BUFFER_BIT);

    this.rotY++;
    if(this.rotY > 360) this.rotY -= 360;

    var modelView = mat4.create();
    mat4.identity(modelView);
    mat4.rotate(modelView, this.rotY/180*Math.PI, [0, 1, 0]);
    mat4.rotate(modelView, -Math.PI/2, [1, 0, 0]);
    mat4.scale(modelView, [0.1, 0.1, 0.1]);
    gl.uniformMatrix4fv(this.program.uniforms.MVMatrix, false, modelView);
    if(this.model) this.program.draw(gl, this.model);
    gl.flush();
};// stats.js r8 - http://github.com/mrdoob/stats.js
goog.provide("Rendering.Stats");

Rendering.Stats = function(){var h,a,n=0,o=0,i=Date.now(),u=i,p=i,l=0,q=1E3,r=0,e,j,f,b=[[16,16,48],[0,255,255]],m=0,s=1E3,t=0,d,k,g,c=[[16,48,16],[0,255,0]];h=document.createElement("div");h.style.cursor="pointer";h.style.width="80px";h.style.opacity="0.9";h.style.zIndex="10001";h.addEventListener("mousedown",function(a){a.preventDefault();n=(n+1)%2;n==0?(e.style.display="block",d.style.display="none"):(e.style.display="none",d.style.display="block")},!1);e=document.createElement("div");e.style.textAlign=
"left";e.style.lineHeight="1.2em";e.style.backgroundColor="rgb("+Math.floor(b[0][0]/2)+","+Math.floor(b[0][1]/2)+","+Math.floor(b[0][2]/2)+")";e.style.padding="0 0 3px 3px";h.appendChild(e);j=document.createElement("div");j.style.fontFamily="Helvetica, Arial, sans-serif";j.style.fontSize="9px";j.style.color="rgb("+b[1][0]+","+b[1][1]+","+b[1][2]+")";j.style.fontWeight="bold";j.innerHTML="FPS";e.appendChild(j);f=document.createElement("div");f.style.position="relative";f.style.width="74px";f.style.height=
"30px";f.style.backgroundColor="rgb("+b[1][0]+","+b[1][1]+","+b[1][2]+")";for(e.appendChild(f);f.children.length<74;)a=document.createElement("span"),a.style.width="1px",a.style.height="30px",a.style.cssFloat="left",a.style.backgroundColor="rgb("+b[0][0]+","+b[0][1]+","+b[0][2]+")",f.appendChild(a);d=document.createElement("div");d.style.textAlign="left";d.style.lineHeight="1.2em";d.style.backgroundColor="rgb("+Math.floor(c[0][0]/2)+","+Math.floor(c[0][1]/2)+","+Math.floor(c[0][2]/2)+")";d.style.padding=
"0 0 3px 3px";d.style.display="none";h.appendChild(d);k=document.createElement("div");k.style.fontFamily="Helvetica, Arial, sans-serif";k.style.fontSize="9px";k.style.color="rgb("+c[1][0]+","+c[1][1]+","+c[1][2]+")";k.style.fontWeight="bold";k.innerHTML="MS";d.appendChild(k);g=document.createElement("div");g.style.position="relative";g.style.width="74px";g.style.height="30px";g.style.backgroundColor="rgb("+c[1][0]+","+c[1][1]+","+c[1][2]+")";for(d.appendChild(g);g.children.length<74;)a=document.createElement("span"),
a.style.width="1px",a.style.height=Math.random()*30+"px",a.style.cssFloat="left",a.style.backgroundColor="rgb("+c[0][0]+","+c[0][1]+","+c[0][2]+")",g.appendChild(a);return{domElement:h,update:function(){i=Date.now();m=i-u;s=Math.min(s,m);t=Math.max(t,m);k.textContent=m+" MS ("+s+"-"+t+")";var a=Math.min(30,30-m/200*30);g.appendChild(g.firstChild).style.height=a+"px";u=i;o++;if(i>p+1E3)l=Math.round(o*1E3/(i-p)),q=Math.min(q,l),r=Math.max(r,l),j.textContent=l+" FPS ("+q+"-"+r+")",a=Math.min(30,30-l/
100*30),f.appendChild(f.firstChild).style.height=a+"px",p=i,o=0}}};

/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 09.03.12
 * Time: 23:01
 * To change this template use File | Settings | File Templates.
 */

goog.provide("Rendering.Demos_Demo3");
goog.require('Rendering.Demos_Interface');
goog.require("Rendering.Import.Element_Array");
goog.require("Rendering.Programs_Texture");
goog.require('Rendering.Model');

/**
 * @constructor
 * @implements {Rendering.Demos_Interface}
 * @param {WebGLRenderingContext}
*/
Rendering.Demos_Demo3 = function(gl) {
    /*
     * @type {Rendering.Programs_Interface}
     */
    this.program = new Rendering.Programs_Texture(gl);

    /*
     * @type {number}
     */
    this.rotX = 30;
    /*
     * @type {number}
     */
    this.rotY = 30;
    /*
     * @type {number}
     */
    this.rotZ = 0;
    /*
     * @type {Rendering.Model?}
     */
    this.model = null;
};

Rendering.Demos_Demo3.prototype.title = "Textured T-Rex";
/**
 * @param {WebGLRenderingContext}
 */
Rendering.Demos_Demo3.prototype.run = function(gl) {
    console.log("run demo 3");

    var that = this;
    var parser = new Rendering.Import.Element_Array();
    parser.load('assets/tyrannosaurus_rex/tyrannosaurus_rex_vertices.dat',
        'assets/tyrannosaurus_rex/tyrannosaurus_rex_faces.dat',
        function(vertices, normals, uvs) {
            that.model = new Rendering.Model();
            that.model.createVerticesBuffer(gl, vertices);
            if(normals) that.model.createNormalsBuffer(gl, normals);
            if(uvs) that.model.createUVsBuffer(gl, uvs);

            that.model.loadTexture(gl, 'assets/tyrannosaurus_rex/tyrannosaurus_rex_diffuse.png');
        }
    );

    gl.useProgram(this.program.program);
};

Rendering.Demos_Demo3.prototype.stop = function() {
    console.log("stop demo 3");

    delete this.model;
};
/**
 * @param {WebGLRenderingContext}
 */
Rendering.Demos_Demo3.prototype.frame = function(gl) {
    gl.clear(gl.COLOR_BUFFER_BIT);

    this.rotY++;
    if(this.rotY > 360) this.rotY -= 360;

    var modelView = mat4.create();
    mat4.identity(modelView);
    mat4.rotate(modelView, this.rotY/180*Math.PI, [0, 1, 0]);
    mat4.rotate(modelView, -Math.PI/2, [1, 0, 0]);
    mat4.scale(modelView, [0.1, 0.1, 0.1]);
    gl.uniformMatrix4fv(this.program.uniforms.MVMatrix, false, modelView);

    if(this.model && this.model.textureLoaded) this.program.draw(gl, this.model);
    gl.flush();
};/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 09.03.12
 * Time: 23:01
 * To change this template use File | Settings | File Templates.
 */

goog.provide("Rendering.Demos_Demo2");
goog.require('Rendering.Demos_Interface');
goog.require('Rendering.Programs_Basic');
goog.require("Rendering.Import.Element_Array");
goog.require('Rendering.Model');


/**
 * @constructor
 * @implements {Rendering.Demos_Interface}
 * @param {WebGLRenderingContext}
*/
Rendering.Demos_Demo2 = function(gl) {
    /**
     * @type {Rendering.Programs_Interface}
     */
    this.program = new Rendering.Programs_Basic(gl);

    /**     * @type {number}
     */
    this.rotX = 30;
    /**     * @type {number}
     */
    this.rotY = 30;
    /**     * @type {number}
     */
    this.rotZ = 0;
    /**     * @type {Rendering.Model?}
     */
    this.model = null;
};

/** * @const
 * @type {string}
 */
Rendering.Demos_Demo2.prototype.title = "Init canvas - Dragon";
/** * @param {WebGLRenderingContext}
 */
Rendering.Demos_Demo2.prototype.run = function(gl) {
    console.log("run demo 2");

    var that = this;
    var parser = new Rendering.Import.Element_Array();
    parser.load('assets/dragon/dragon_vertices.dat',
        'assets/dragon/dragon_faces.dat',
        function(vertices, normals, uvs) {
            that.model = new Rendering.Model();
            that.model.createVerticesBuffer(gl, vertices);
            if(normals) that.model.createNormalsBuffer(gl, normals);
            if(uvs) that.model.createUVsBuffer(gl, uvs);
        }
    );

    gl.useProgram(this.program.program);
};

Rendering.Demos_Demo2.prototype.stop = function() {
    console.log("stop demo 2");

    delete this.model;
    delete this.program;
};
/** * @param {WebGLRenderingContext}
 */
Rendering.Demos_Demo2.prototype.frame = function(gl) {
    gl.clear(gl.COLOR_BUFFER_BIT);

    this.rotY++;
    if(this.rotY > 360) this.rotY -= 360;

    var modelView = mat4.create();
    mat4.identity(modelView);
    mat4.rotate(modelView, this.rotY/180*Math.PI, [0, 1, 0]);
    mat4.rotate(modelView, -Math.PI/2, [1, 0, 0]);
    mat4.scale(modelView, [0.1, 0.1, 0.1]);
    gl.uniformMatrix4fv(this.program.uniforms.MVMatrix, false, modelView);

    if(this.model) this.program.draw(gl, this.model);
    gl.flush();
};/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 09.03.12
 * Time: 23:01
 * To change this template use File | Settings | File Templates.
 */

goog.provide("Rendering.Demos_Demo5");
goog.require('Rendering.Demos_Interface');
goog.require("Rendering.Import.Element_Array");
goog.require("Rendering.Programs_Light_Texture");
goog.require('Rendering.Model');


/**
 * @constructor
 * @implements {Rendering.Demos_Interface}
 * @param {WebGLRenderingContext}
    */
Rendering.Demos_Demo5 = function(gl) {
    /*
     * @type {Rendering.Programs_Interface}
     */
    this.program = new Rendering.Programs_Light_Texture(gl);

    /*
     * @type {Rendering.Model?}
     */
    this.model = null;

    /**
     * @type {mat4}
     */
    this.modelView = mat4.create();
    mat4.identity(this.modelView);
    mat4.rotate(this.modelView, -Math.PI/2, [1, 0, 0]);
    mat4.rotate(this.modelView, -Math.PI/2, [0, 0, 1]);
    mat4.scale(this.modelView, [0.1, 0.1, 0.1]);

    this.light = vec3.create();

    this.lightMat = mat4.create();
    mat4.identity(this.lightMat);
};


Rendering.Demos_Demo5.prototype.title = "Lights & Textured T-Rex - better GC";
/**
 * @param {WebGLRenderingContext}
    */
Rendering.Demos_Demo5.prototype.run = function(gl) {
    console.log("run demo 5");

    var that = this;
    var parser = new Rendering.Import.Element_Array();
    parser.load('assets/tyrannosaurus_rex/tyrannosaurus_rex_vertices.dat',
        'assets/tyrannosaurus_rex/tyrannosaurus_rex_faces.dat',
        function(vertices, normals, uvs) {
            that.model = new Rendering.Model();
            that.model.createVerticesBuffer(gl, vertices);
            if(normals) that.model.createNormalsBuffer(gl, normals);
            if(uvs) that.model.createUVsBuffer(gl, uvs);

            that.model.loadTexture(gl, 'assets/tyrannosaurus_rex/tyrannosaurus_rex_diffuse.png');
        }
    );
    gl.useProgram(this.program.program);
};

Rendering.Demos_Demo5.prototype.stop = function() {
    console.log("stop demo 5");

    delete this.model;
    delete this.modelView;
    delete this.program;
    delete this.light;
    delete this.lightMat;
};
/**
 * @param {WebGLRenderingContext}
    */
Rendering.Demos_Demo5.prototype.frame = function(gl) {
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniformMatrix4fv(this.program.uniforms.MVMatrix, false, this.modelView);

    mat4.rotate(this.lightMat, 1.0/180*Math.PI, [0, 0, 1]);
    mat4.rotate(this.lightMat, 1.0/180*Math.PI, [1, 0, 0]);
    mat4.multiplyVec3(this.lightMat, this.light);

    gl.uniform3f(this.program.uniforms.Light, this.light[0], this.light[1], this.light[2]);
    this.light[0] = 0.85;
    this.light[1] = 0.8;
    this.light[2] = 0.75;

    if(this.model && this.model.textureLoaded) this.program.draw(gl, this.model);
    gl.flush();
};/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 09.03.12
 * Time: 23:01
 * To change this template use File | Settings | File Templates.
 */

goog.provide("Rendering.Demos_Demo4");
goog.require('Rendering.Demos_Interface');
goog.require("Rendering.Import.Element_Array");
goog.require("Rendering.Programs_Light_Texture");
goog.require('Rendering.Model');


/**
 * @constructor
 * @implements {Rendering.Demos_Interface}
 * @param {WebGLRenderingContext}
*/
Rendering.Demos_Demo4 = function(gl) {
    /*
     * @type {Rendering.Programs_Interface}
     */
    this.program = new Rendering.Programs_Light_Texture(gl);

    /*
     * @type {number}
     */
    this.rot = 30;

    /*
     * @type {Rendering.Model?}
     */
    this.model = null;
};


Rendering.Demos_Demo4.prototype.title = "Lights & Textured T-Rex";
/**
 * @param {WebGLRenderingContext}
 */
Rendering.Demos_Demo4.prototype.run = function(gl) {
    console.log("run demo 4");

    var that = this;
    var parser = new Rendering.Import.Element_Array();
    parser.load('assets/tyrannosaurus_rex/tyrannosaurus_rex_vertices.dat',
        'assets/tyrannosaurus_rex/tyrannosaurus_rex_faces.dat',
        function(vertices, normals, uvs) {
            that.model = new Rendering.Model();
            that.model.createVerticesBuffer(gl, vertices);
            if(normals) that.model.createNormalsBuffer(gl, normals);
            if(uvs) that.model.createUVsBuffer(gl, uvs);

            that.model.loadTexture(gl, 'assets/tyrannosaurus_rex/tyrannosaurus_rex_diffuse.png');
        }
    );
    gl.useProgram(this.program.program);
};

Rendering.Demos_Demo4.prototype.stop = function() {
    console.log("stop demo 4");

    delete this.model;
    delete this.program;
};
/**
 * @param {WebGLRenderingContext}
 */
Rendering.Demos_Demo4.prototype.frame = function(gl) {
    gl.clear(gl.COLOR_BUFFER_BIT);

    this.rot++;
    if(this.rot > 360) this.rot -= 360;

    var modelView = mat4.create();
    mat4.identity(modelView);
    mat4.rotate(modelView, -Math.PI/2, [1, 0, 0]);
    mat4.rotate(modelView, -Math.PI/2, [0, 0, 1]);
    mat4.scale(modelView, [0.1, 0.1, 0.1]);
    gl.uniformMatrix4fv(this.program.uniforms.MVMatrix, false, modelView);

    var light = vec3.create([0.85, 0.8, 0.75]);

    var lightMat = mat4.create();
    mat4.identity(lightMat);
    mat4.rotate(lightMat, this.rot/180*Math.PI, [0, 0, 1]);
    mat4.rotate(lightMat, this.rot/180*Math.PI, [1, 0, 0]);
    mat4.multiplyVec3(lightMat, light);
    gl.uniform3f(this.program.uniforms.Light, light[0], light[1], light[2]);

    if(this.model && this.model.textureLoaded) this.program.draw(gl, this.model);
    gl.flush();
};// Copyright 2006 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Constant declarations for common key codes.
 *
 * @author eae@google.com (Emil A Eklund)
 * @see ../demos/keyhandler.html
 */

goog.provide('goog.events.KeyCodes');

goog.require('goog.userAgent');


/**
 * Key codes for common characters.
 *
 * This list is not localized and therefore some of the key codes are not
 * correct for non US keyboard layouts. See comments below.
 *
 * @enum {number}
 */
goog.events.KeyCodes = {
  WIN_KEY_FF_LINUX: 0,
  MAC_ENTER: 3,
  BACKSPACE: 8,
  TAB: 9,
  NUM_CENTER: 12,  // NUMLOCK on FF/Safari Mac
  ENTER: 13,
  SHIFT: 16,
  CTRL: 17,
  ALT: 18,
  PAUSE: 19,
  CAPS_LOCK: 20,
  ESC: 27,
  SPACE: 32,
  PAGE_UP: 33,     // also NUM_NORTH_EAST
  PAGE_DOWN: 34,   // also NUM_SOUTH_EAST
  END: 35,         // also NUM_SOUTH_WEST
  HOME: 36,        // also NUM_NORTH_WEST
  LEFT: 37,        // also NUM_WEST
  UP: 38,          // also NUM_NORTH
  RIGHT: 39,       // also NUM_EAST
  DOWN: 40,        // also NUM_SOUTH
  PRINT_SCREEN: 44,
  INSERT: 45,      // also NUM_INSERT
  DELETE: 46,      // also NUM_DELETE
  ZERO: 48,
  ONE: 49,
  TWO: 50,
  THREE: 51,
  FOUR: 52,
  FIVE: 53,
  SIX: 54,
  SEVEN: 55,
  EIGHT: 56,
  NINE: 57,
  FF_SEMICOLON: 59, // Firefox (Gecko) fires this for semicolon instead of 186
  FF_EQUALS: 61, // Firefox (Gecko) fires this for equals instead of 187
  QUESTION_MARK: 63, // needs localization
  A: 65,
  B: 66,
  C: 67,
  D: 68,
  E: 69,
  F: 70,
  G: 71,
  H: 72,
  I: 73,
  J: 74,
  K: 75,
  L: 76,
  M: 77,
  N: 78,
  O: 79,
  P: 80,
  Q: 81,
  R: 82,
  S: 83,
  T: 84,
  U: 85,
  V: 86,
  W: 87,
  X: 88,
  Y: 89,
  Z: 90,
  META: 91, // WIN_KEY_LEFT
  WIN_KEY_RIGHT: 92,
  CONTEXT_MENU: 93,
  NUM_ZERO: 96,
  NUM_ONE: 97,
  NUM_TWO: 98,
  NUM_THREE: 99,
  NUM_FOUR: 100,
  NUM_FIVE: 101,
  NUM_SIX: 102,
  NUM_SEVEN: 103,
  NUM_EIGHT: 104,
  NUM_NINE: 105,
  NUM_MULTIPLY: 106,
  NUM_PLUS: 107,
  NUM_MINUS: 109,
  NUM_PERIOD: 110,
  NUM_DIVISION: 111,
  F1: 112,
  F2: 113,
  F3: 114,
  F4: 115,
  F5: 116,
  F6: 117,
  F7: 118,
  F8: 119,
  F9: 120,
  F10: 121,
  F11: 122,
  F12: 123,
  NUMLOCK: 144,
  SCROLL_LOCK: 145,

  // OS-specific media keys like volume controls and browser controls.
  FIRST_MEDIA_KEY: 166,
  LAST_MEDIA_KEY: 183,

  SEMICOLON: 186,            // needs localization
  DASH: 189,                 // needs localization
  EQUALS: 187,               // needs localization
  COMMA: 188,                // needs localization
  PERIOD: 190,               // needs localization
  SLASH: 191,                // needs localization
  APOSTROPHE: 192,           // needs localization
  TILDE: 192,                // needs localization
  SINGLE_QUOTE: 222,         // needs localization
  OPEN_SQUARE_BRACKET: 219,  // needs localization
  BACKSLASH: 220,            // needs localization
  CLOSE_SQUARE_BRACKET: 221, // needs localization
  WIN_KEY: 224,
  MAC_FF_META: 224, // Firefox (Gecko) fires this for the meta key instead of 91
  WIN_IME: 229,

  // We've seen users whose machines fire this keycode at regular one
  // second intervals. The common thread among these users is that
  // they're all using Dell Inspiron laptops, so we suspect that this
  // indicates a hardware/bios problem.
  // http://en.community.dell.com/support-forums/laptop/f/3518/p/19285957/19523128.aspx
  PHANTOM: 255
};


/**
 * Returns true if the event contains a text modifying key.
 * @param {goog.events.BrowserEvent} e A key event.
 * @return {boolean} Whether it's a text modifying key.
 */
goog.events.KeyCodes.isTextModifyingKeyEvent = function(e) {
  if (e.altKey && !e.ctrlKey ||
      e.metaKey ||
      // Function keys don't generate text
      e.keyCode >= goog.events.KeyCodes.F1 &&
      e.keyCode <= goog.events.KeyCodes.F12) {
    return false;
  }

  // The following keys are quite harmless, even in combination with
  // CTRL, ALT or SHIFT.
  switch (e.keyCode) {
    case goog.events.KeyCodes.ALT:
    case goog.events.KeyCodes.CAPS_LOCK:
    case goog.events.KeyCodes.CONTEXT_MENU:
    case goog.events.KeyCodes.CTRL:
    case goog.events.KeyCodes.DOWN:
    case goog.events.KeyCodes.END:
    case goog.events.KeyCodes.ESC:
    case goog.events.KeyCodes.HOME:
    case goog.events.KeyCodes.INSERT:
    case goog.events.KeyCodes.LEFT:
    case goog.events.KeyCodes.MAC_FF_META:
    case goog.events.KeyCodes.META:
    case goog.events.KeyCodes.NUMLOCK:
    case goog.events.KeyCodes.NUM_CENTER:
    case goog.events.KeyCodes.PAGE_DOWN:
    case goog.events.KeyCodes.PAGE_UP:
    case goog.events.KeyCodes.PAUSE:
    case goog.events.KeyCodes.PHANTOM:
    case goog.events.KeyCodes.PRINT_SCREEN:
    case goog.events.KeyCodes.RIGHT:
    case goog.events.KeyCodes.SCROLL_LOCK:
    case goog.events.KeyCodes.SHIFT:
    case goog.events.KeyCodes.UP:
    case goog.events.KeyCodes.WIN_KEY:
    case goog.events.KeyCodes.WIN_KEY_RIGHT:
      return false;
    case goog.events.KeyCodes.WIN_KEY_FF_LINUX:
      return !goog.userAgent.GECKO;
    default:
      return e.keyCode < goog.events.KeyCodes.FIRST_MEDIA_KEY ||
          e.keyCode > goog.events.KeyCodes.LAST_MEDIA_KEY;
  }
};


/**
 * Returns true if the key fires a keypress event in the current browser.
 *
 * Accoridng to MSDN [1] IE only fires keypress events for the following keys:
 * - Letters: A - Z (uppercase and lowercase)
 * - Numerals: 0 - 9
 * - Symbols: ! @ # $ % ^ & * ( ) _ - + = < [ ] { } , . / ? \ | ' ` " ~
 * - System: ESC, SPACEBAR, ENTER
 *
 * That's not entirely correct though, for instance there's no distinction
 * between upper and lower case letters.
 *
 * [1] http://msdn2.microsoft.com/en-us/library/ms536939(VS.85).aspx)
 *
 * Safari is similar to IE, but does not fire keypress for ESC.
 *
 * Additionally, IE6 does not fire keydown or keypress events for letters when
 * the control or alt keys are held down and the shift key is not. IE7 does
 * fire keydown in these cases, though, but not keypress.
 *
 * @param {number} keyCode A key code.
 * @param {number=} opt_heldKeyCode Key code of a currently-held key.
 * @param {boolean=} opt_shiftKey Whether the shift key is held down.
 * @param {boolean=} opt_ctrlKey Whether the control key is held down.
 * @param {boolean=} opt_altKey Whether the alt key is held down.
 * @return {boolean} Whether it's a key that fires a keypress event.
 */
goog.events.KeyCodes.firesKeyPressEvent = function(keyCode, opt_heldKeyCode,
    opt_shiftKey, opt_ctrlKey, opt_altKey) {
  if (!goog.userAgent.IE &&
      !(goog.userAgent.WEBKIT && goog.userAgent.isVersion('525'))) {
    return true;
  }

  if (goog.userAgent.MAC && opt_altKey) {
    return goog.events.KeyCodes.isCharacterKey(keyCode);
  }

  // Alt but not AltGr which is represented as Alt+Ctrl.
  if (opt_altKey && !opt_ctrlKey) {
    return false;
  }

  // Saves Ctrl or Alt + key for IE and WebKit 525+, which won't fire keypress.
  // Non-IE browsers and WebKit prior to 525 won't get this far so no need to
  // check the user agent.
  if (!opt_shiftKey &&
      (opt_heldKeyCode == goog.events.KeyCodes.CTRL ||
       opt_heldKeyCode == goog.events.KeyCodes.ALT)) {
    return false;
  }

  // When Ctrl+<somekey> is held in IE, it only fires a keypress once, but it
  // continues to fire keydown events as the event repeats.
  if (goog.userAgent.IE && opt_ctrlKey && opt_heldKeyCode == keyCode) {
    return false;
  }

  switch (keyCode) {
    case goog.events.KeyCodes.ENTER:
      // IE9 does not fire KEYPRESS on ENTER.
      return !(goog.userAgent.IE && goog.userAgent.isDocumentMode(9));
    case goog.events.KeyCodes.ESC:
      return !goog.userAgent.WEBKIT;
  }

  return goog.events.KeyCodes.isCharacterKey(keyCode);
};


/**
 * Returns true if the key produces a character.
 * This does not cover characters on non-US keyboards (Russian, Hebrew, etc.).
 *
 * @param {number} keyCode A key code.
 * @return {boolean} Whether it's a character key.
 */
goog.events.KeyCodes.isCharacterKey = function(keyCode) {
  if (keyCode >= goog.events.KeyCodes.ZERO &&
      keyCode <= goog.events.KeyCodes.NINE) {
    return true;
  }

  if (keyCode >= goog.events.KeyCodes.NUM_ZERO &&
      keyCode <= goog.events.KeyCodes.NUM_MULTIPLY) {
    return true;
  }

  if (keyCode >= goog.events.KeyCodes.A &&
      keyCode <= goog.events.KeyCodes.Z) {
    return true;
  }

  // Safari sends zero key code for non-latin characters.
  if (goog.userAgent.WEBKIT && keyCode == 0) {
    return true;
  }

  switch (keyCode) {
    case goog.events.KeyCodes.SPACE:
    case goog.events.KeyCodes.QUESTION_MARK:
    case goog.events.KeyCodes.NUM_PLUS:
    case goog.events.KeyCodes.NUM_MINUS:
    case goog.events.KeyCodes.NUM_PERIOD:
    case goog.events.KeyCodes.NUM_DIVISION:
    case goog.events.KeyCodes.SEMICOLON:
    case goog.events.KeyCodes.FF_SEMICOLON:
    case goog.events.KeyCodes.DASH:
    case goog.events.KeyCodes.EQUALS:
    case goog.events.KeyCodes.FF_EQUALS:
    case goog.events.KeyCodes.COMMA:
    case goog.events.KeyCodes.PERIOD:
    case goog.events.KeyCodes.SLASH:
    case goog.events.KeyCodes.APOSTROPHE:
    case goog.events.KeyCodes.SINGLE_QUOTE:
    case goog.events.KeyCodes.OPEN_SQUARE_BRACKET:
    case goog.events.KeyCodes.BACKSLASH:
    case goog.events.KeyCodes.CLOSE_SQUARE_BRACKET:
      return true;
    default:
      return false;
  }
};


/**
 * Normalizes key codes from their Gecko-specific value to the general one.
 * @param {number} keyCode The native key code.
 * @return {number} The normalized key code.
 */
goog.events.KeyCodes.normalizeGeckoKeyCode = function(keyCode) {
  switch (keyCode) {
    case goog.events.KeyCodes.FF_EQUALS:
      return goog.events.KeyCodes.EQUALS;
    case goog.events.KeyCodes.FF_SEMICOLON:
      return goog.events.KeyCodes.SEMICOLON;
    case goog.events.KeyCodes.MAC_FF_META:
      return goog.events.KeyCodes.META;
    case goog.events.KeyCodes.WIN_KEY_FF_LINUX:
      return goog.events.KeyCodes.WIN_KEY;
    default:
      return keyCode;
  }
};
// Copyright 2007 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview This file contains a class for working with keyboard events
 * that repeat consistently across browsers and platforms. It also unifies the
 * key code so that it is the same in all browsers and platforms.
 *
 * Different web browsers have very different keyboard event handling. Most
 * importantly is that only certain browsers repeat keydown events:
 * IE, Opera, FF/Win32, and Safari 3 repeat keydown events.
 * FF/Mac and Safari 2 do not.
 *
 * For the purposes of this code, "Safari 3" means WebKit 525+, when WebKit
 * decided that they should try to match IE's key handling behavior.
 * Safari 3.0.4, which shipped with Leopard (WebKit 523), has the
 * Safari 2 behavior.
 *
 * Firefox, Safari, Opera prevent on keypress
 *
 * IE prevents on keydown
 *
 * Firefox does not fire keypress for shift, ctrl, alt
 * Firefox does fire keydown for shift, ctrl, alt, meta
 * Firefox does not repeat keydown for shift, ctrl, alt, meta
 *
 * Firefox does not fire keypress for up and down in an input
 *
 * Opera fires keypress for shift, ctrl, alt, meta
 * Opera does not repeat keypress for shift, ctrl, alt, meta
 *
 * Safari 2 and 3 do not fire keypress for shift, ctrl, alt
 * Safari 2 does not fire keydown for shift, ctrl, alt
 * Safari 3 *does* fire keydown for shift, ctrl, alt
 *
 * IE provides the keycode for keyup/down events and the charcode (in the
 * keycode field) for keypress.
 *
 * Mozilla provides the keycode for keyup/down and the charcode for keypress
 * unless it's a non text modifying key in which case the keycode is provided.
 *
 * Safari 3 provides the keycode and charcode for all events.
 *
 * Opera provides the keycode for keyup/down event and either the charcode or
 * the keycode (in the keycode field) for keypress events.
 *
 * Firefox x11 doesn't fire keydown events if a another key is already held down
 * until the first key is released. This can cause a key event to be fired with
 * a keyCode for the first key and a charCode for the second key.
 *
 * Safari in keypress
 *
 *        charCode keyCode which
 * ENTER:       13      13    13
 * F1:       63236   63236 63236
 * F8:       63243   63243 63243
 * ...
 * p:          112     112   112
 * P:           80      80    80
 *
 * Firefox, keypress:
 *
 *        charCode keyCode which
 * ENTER:        0      13    13
 * F1:           0     112     0
 * F8:           0     119     0
 * ...
 * p:          112       0   112
 * P:           80       0    80
 *
 * Opera, Mac+Win32, keypress:
 *
 *         charCode keyCode which
 * ENTER: undefined      13    13
 * F1:    undefined     112     0
 * F8:    undefined     119     0
 * ...
 * p:     undefined     112   112
 * P:     undefined      80    80
 *
 * IE7, keydown
 *
 *         charCode keyCode     which
 * ENTER: undefined      13 undefined
 * F1:    undefined     112 undefined
 * F8:    undefined     119 undefined
 * ...
 * p:     undefined      80 undefined
 * P:     undefined      80 undefined
 *
 * @author arv@google.com (Erik Arvidsson)
 * @author eae@google.com (Emil A Eklund)
 * @see ../demos/keyhandler.html
 */

goog.provide('goog.events.KeyEvent');
goog.provide('goog.events.KeyHandler');
goog.provide('goog.events.KeyHandler.EventType');

goog.require('goog.events');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.userAgent');



/**
 * A wrapper around an element that you want to listen to keyboard events on.
 * @param {Element|Document=} opt_element The element or document to listen on.
 * @param {boolean=} opt_capture Whether to listen for browser events in
 *     capture phase (defaults to false).
 * @constructor
 * @extends {goog.events.EventTarget}
 */
goog.events.KeyHandler = function(opt_element, opt_capture) {
  goog.events.EventTarget.call(this);

  if (opt_element) {
    this.attach(opt_element, opt_capture);
  }
};
goog.inherits(goog.events.KeyHandler, goog.events.EventTarget);


/**
 * This is the element that we will listen to the real keyboard events on.
 * @type {Element|Document|null}
 * @private
 */
goog.events.KeyHandler.prototype.element_ = null;


/**
 * The key for the key press listener.
 * @type {?number}
 * @private
 */
goog.events.KeyHandler.prototype.keyPressKey_ = null;


/**
 * The key for the key down listener.
 * @type {?number}
 * @private
 */
goog.events.KeyHandler.prototype.keyDownKey_ = null;


/**
 * The key for the key up listener.
 * @type {?number}
 * @private
 */
goog.events.KeyHandler.prototype.keyUpKey_ = null;


/**
 * Used to detect keyboard repeat events.
 * @private
 * @type {number}
 */
goog.events.KeyHandler.prototype.lastKey_ = -1;


/**
 * Keycode recorded for key down events. As most browsers don't report the
 * keycode in the key press event we need to record it in the key down phase.
 * @private
 * @type {number}
 */
goog.events.KeyHandler.prototype.keyCode_ = -1;


/**
 * Enum type for the events fired by the key handler
 * @enum {string}
 */
goog.events.KeyHandler.EventType = {
  KEY: 'key'
};


/**
 * An enumeration of key codes that Safari 2 does incorrectly
 * @type {Object}
 * @private
 */
goog.events.KeyHandler.safariKey_ = {
  '3': goog.events.KeyCodes.ENTER, // 13
  '12': goog.events.KeyCodes.NUMLOCK, // 144
  '63232': goog.events.KeyCodes.UP, // 38
  '63233': goog.events.KeyCodes.DOWN, // 40
  '63234': goog.events.KeyCodes.LEFT, // 37
  '63235': goog.events.KeyCodes.RIGHT, // 39
  '63236': goog.events.KeyCodes.F1, // 112
  '63237': goog.events.KeyCodes.F2, // 113
  '63238': goog.events.KeyCodes.F3, // 114
  '63239': goog.events.KeyCodes.F4, // 115
  '63240': goog.events.KeyCodes.F5, // 116
  '63241': goog.events.KeyCodes.F6, // 117
  '63242': goog.events.KeyCodes.F7, // 118
  '63243': goog.events.KeyCodes.F8, // 119
  '63244': goog.events.KeyCodes.F9, // 120
  '63245': goog.events.KeyCodes.F10, // 121
  '63246': goog.events.KeyCodes.F11, // 122
  '63247': goog.events.KeyCodes.F12, // 123
  '63248': goog.events.KeyCodes.PRINT_SCREEN, // 44
  '63272': goog.events.KeyCodes.DELETE, // 46
  '63273': goog.events.KeyCodes.HOME, // 36
  '63275': goog.events.KeyCodes.END, // 35
  '63276': goog.events.KeyCodes.PAGE_UP, // 33
  '63277': goog.events.KeyCodes.PAGE_DOWN, // 34
  '63289': goog.events.KeyCodes.NUMLOCK, // 144
  '63302': goog.events.KeyCodes.INSERT // 45
};


/**
 * An enumeration of key identifiers currently part of the W3C draft for DOM3
 * and their mappings to keyCodes.
 * http://www.w3.org/TR/DOM-Level-3-Events/keyset.html#KeySet-Set
 * This is currently supported in Safari and should be platform independent.
 * @type {Object}
 * @private
 */
goog.events.KeyHandler.keyIdentifier_ = {
  'Up': goog.events.KeyCodes.UP, // 38
  'Down': goog.events.KeyCodes.DOWN, // 40
  'Left': goog.events.KeyCodes.LEFT, // 37
  'Right': goog.events.KeyCodes.RIGHT, // 39
  'Enter': goog.events.KeyCodes.ENTER, // 13
  'F1': goog.events.KeyCodes.F1, // 112
  'F2': goog.events.KeyCodes.F2, // 113
  'F3': goog.events.KeyCodes.F3, // 114
  'F4': goog.events.KeyCodes.F4, // 115
  'F5': goog.events.KeyCodes.F5, // 116
  'F6': goog.events.KeyCodes.F6, // 117
  'F7': goog.events.KeyCodes.F7, // 118
  'F8': goog.events.KeyCodes.F8, // 119
  'F9': goog.events.KeyCodes.F9, // 120
  'F10': goog.events.KeyCodes.F10, // 121
  'F11': goog.events.KeyCodes.F11, // 122
  'F12': goog.events.KeyCodes.F12, // 123
  'U+007F': goog.events.KeyCodes.DELETE, // 46
  'Home': goog.events.KeyCodes.HOME, // 36
  'End': goog.events.KeyCodes.END, // 35
  'PageUp': goog.events.KeyCodes.PAGE_UP, // 33
  'PageDown': goog.events.KeyCodes.PAGE_DOWN, // 34
  'Insert': goog.events.KeyCodes.INSERT // 45
};


/**
 * If true, the KeyEvent fires on keydown. Otherwise, it fires on keypress.
 *
 * @type {boolean}
 * @private
 */
goog.events.KeyHandler.USES_KEYDOWN_ = goog.userAgent.IE ||
    goog.userAgent.WEBKIT && goog.userAgent.isVersion('525');


/**
 * Records the keycode for browsers that only returns the keycode for key up/
 * down events. For browser/key combinations that doesn't trigger a key pressed
 * event it also fires the patched key event.
 * @param {goog.events.BrowserEvent} e The key down event.
 * @private
 */
goog.events.KeyHandler.prototype.handleKeyDown_ = function(e) {

  // Ctrl-Tab and Alt-Tab can cause the focus to be moved to another window
  // before we've caught a key-up event.  If the last-key was one of these we
  // reset the state.
  if (goog.userAgent.WEBKIT &&
      (this.lastKey_ == goog.events.KeyCodes.CTRL && !e.ctrlKey ||
       this.lastKey_ == goog.events.KeyCodes.ALT && !e.altKey)) {
    this.lastKey_ = -1;
    this.keyCode_ = -1;
  }

  if (goog.events.KeyHandler.USES_KEYDOWN_ &&
      !goog.events.KeyCodes.firesKeyPressEvent(e.keyCode,
          this.lastKey_, e.shiftKey, e.ctrlKey, e.altKey)) {
    this.handleEvent(e);
  } else {
    this.keyCode_ = goog.userAgent.GECKO ?
        goog.events.KeyCodes.normalizeGeckoKeyCode(e.keyCode) :
        e.keyCode;
  }
};


/**
 * Clears the stored previous key value, resetting the key repeat status. Uses
 * -1 because the Safari 3 Windows beta reports 0 for certain keys (like Home
 * and End.)
 * @param {goog.events.BrowserEvent} e The keyup event.
 * @private
 */
goog.events.KeyHandler.prototype.handleKeyup_ = function(e) {
  this.lastKey_ = -1;
  this.keyCode_ = -1;
};


/**
 * Handles the events on the element.
 * @param {goog.events.BrowserEvent} e  The keyboard event sent from the
 *     browser.
 */
goog.events.KeyHandler.prototype.handleEvent = function(e) {
  var be = e.getBrowserEvent();
  var keyCode, charCode;

  // IE reports the character code in the keyCode field for keypress events.
  // There are two exceptions however, Enter and Escape.
  if (goog.userAgent.IE && e.type == goog.events.EventType.KEYPRESS) {
    keyCode = this.keyCode_;
    charCode = keyCode != goog.events.KeyCodes.ENTER &&
        keyCode != goog.events.KeyCodes.ESC ?
            be.keyCode : 0;

  // Safari reports the character code in the keyCode field for keypress
  // events but also has a charCode field.
  } else if (goog.userAgent.WEBKIT &&
      e.type == goog.events.EventType.KEYPRESS) {
    keyCode = this.keyCode_;
    charCode = be.charCode >= 0 && be.charCode < 63232 &&
        goog.events.KeyCodes.isCharacterKey(keyCode) ?
            be.charCode : 0;

  // Opera reports the keycode or the character code in the keyCode field.
  } else if (goog.userAgent.OPERA) {
    keyCode = this.keyCode_;
    charCode = goog.events.KeyCodes.isCharacterKey(keyCode) ?
        be.keyCode : 0;

  // Mozilla reports the character code in the charCode field.
  } else {
    keyCode = be.keyCode || this.keyCode_;
    charCode = be.charCode || 0;
    // On the Mac, shift-/ triggers a question mark char code and no key code
    // (normalized to WIN_KEY), so we synthesize the latter.
    if (goog.userAgent.MAC &&
        charCode == goog.events.KeyCodes.QUESTION_MARK &&
        keyCode == goog.events.KeyCodes.WIN_KEY) {
      keyCode = goog.events.KeyCodes.SLASH;
    }
  }

  var key = keyCode;
  var keyIdentifier = be.keyIdentifier;

  // Correct the key value for certain browser-specific quirks.
  if (keyCode) {
    if (keyCode >= 63232 && keyCode in goog.events.KeyHandler.safariKey_) {
      // NOTE(nicksantos): Safari 3 has fixed this problem,
      // this is only needed for Safari 2.
      key = goog.events.KeyHandler.safariKey_[keyCode];
    } else {

      // Safari returns 25 for Shift+Tab instead of 9.
      if (keyCode == 25 && e.shiftKey) {
        key = 9;
      }
    }
  } else if (keyIdentifier &&
             keyIdentifier in goog.events.KeyHandler.keyIdentifier_) {
    // This is needed for Safari Windows because it currently doesn't give a
    // keyCode/which for non printable keys.
    key = goog.events.KeyHandler.keyIdentifier_[keyIdentifier];
  }

  // If we get the same keycode as a keydown/keypress without having seen a
  // keyup event, then this event was caused by key repeat.
  var repeat = key == this.lastKey_;
  this.lastKey_ = key;

  var event = new goog.events.KeyEvent(key, charCode, repeat, be);
  try {
    this.dispatchEvent(event);
  } finally {
    event.dispose();
  }
};


/**
 * Returns the element listened on for the real keyboard events.
 * @return {Element|Document|null} The element listened on for the real
 *     keyboard events.
 */
goog.events.KeyHandler.prototype.getElement = function() {
  return this.element_;
};


/**
 * Adds the proper key event listeners to the element.
 * @param {Element|Document} element The element to listen on.
 * @param {boolean=} opt_capture Whether to listen for browser events in
 *     capture phase (defaults to false).
 */
goog.events.KeyHandler.prototype.attach = function(element, opt_capture) {
  if (this.keyUpKey_) {
    this.detach();
  }

  this.element_ = element;

  this.keyPressKey_ = goog.events.listen(this.element_,
                                         goog.events.EventType.KEYPRESS,
                                         this,
                                         opt_capture);

  // Most browsers (Safari 2 being the notable exception) doesn't include the
  // keyCode in keypress events (IE has the char code in the keyCode field and
  // Mozilla only included the keyCode if there's no charCode). Thus we have to
  // listen for keydown to capture the keycode.
  this.keyDownKey_ = goog.events.listen(this.element_,
                                        goog.events.EventType.KEYDOWN,
                                        this.handleKeyDown_,
                                        opt_capture,
                                        this);


  this.keyUpKey_ = goog.events.listen(this.element_,
                                      goog.events.EventType.KEYUP,
                                      this.handleKeyup_,
                                      opt_capture,
                                      this);
};


/**
 * Removes the listeners that may exist.
 */
goog.events.KeyHandler.prototype.detach = function() {
  if (this.keyPressKey_) {
    goog.events.unlistenByKey(this.keyPressKey_);
    goog.events.unlistenByKey(this.keyDownKey_);
    goog.events.unlistenByKey(this.keyUpKey_);
    this.keyPressKey_ = null;
    this.keyDownKey_ = null;
    this.keyUpKey_ = null;
  }
  this.element_ = null;
  this.lastKey_ = -1;
  this.keyCode_ = -1;
};


/** @override */
goog.events.KeyHandler.prototype.disposeInternal = function() {
  goog.events.KeyHandler.superClass_.disposeInternal.call(this);
  this.detach();
};



/**
 * This class is used for the goog.events.KeyHandler.EventType.KEY event and
 * it overrides the key code with the fixed key code.
 * @param {number} keyCode The adjusted key code.
 * @param {number} charCode The unicode character code.
 * @param {boolean} repeat Whether this event was generated by keyboard repeat.
 * @param {Event} browserEvent Browser event object.
 * @constructor
 * @extends {goog.events.BrowserEvent}
 */
goog.events.KeyEvent = function(keyCode, charCode, repeat, browserEvent) {
  goog.events.BrowserEvent.call(this, browserEvent);
  this.type = goog.events.KeyHandler.EventType.KEY;

  /**
   * Keycode of key press.
   * @type {number}
   */
  this.keyCode = keyCode;

  /**
   * Unicode character code.
   * @type {number}
   */
  this.charCode = charCode;

  /**
   * True if this event was generated by keyboard auto-repeat (i.e., the user is
   * holding the key down.)
   * @type {boolean}
   */
  this.repeat = repeat;
};
goog.inherits(goog.events.KeyEvent, goog.events.BrowserEvent);
/**
 * Created with JetBrains PhpStorm.
 * User: fridek
 * Date: 02.04.12
 * Time: 23:17
 * To change this template use File | Settings | File Templates.
 */

goog.provide("Rendering.Camera");

goog.require("goog.events.KeyHandler");

/**
 * @constructor
 */
Rendering.Camera = function() {
    /**
     *
     * @type {vec3}
     */
    this.position = vec3.create([0,0,1]);
    /**
     * @type {mat4}
     */
    this.projection = mat4.perspective(60, 4/2, 0.1, 100);

    /**
     * @type {mat4}
     */
    this.translation = mat4.identity();
    mat4.translate(this.translation, [0,0,-1]);

    /**
     * @type {mat4}
     */
    this.rotation = mat4.lookAt(this.position, [0, 0, 0], [0, 1, 0]);

    /**
     * @type {mat4}
     */
    this.view = mat4.identity();

    mat4.multiply(this.rotation, this.translation, this.view);
};

Rendering.Camera.prototype.rebuildViewMatrix = function() {
    this.translation = mat4.identity();

    /**
     * @type {vec3}
     */
    var tmpTranslate = vec3.create();
    vec3.negate(this.position, tmpTranslate);

    this.translation = mat4.identity();
    mat4.translate(this.translation, tmpTranslate);

    this.rotation = mat4.lookAt(this.position, [0, 0, 0], [0, 1, 0]);

    this.view = mat4.identity();
    mat4.multiply(this.rotation, this.translation, this.view);
};

Rendering.Camera.prototype.bindPositionToKeyboard = function() {
    var that = this;
    var keyHandler = /** @type {goog.events.KeyHandler} */ new goog.events.KeyHandler(window);
    goog.events.listen(keyHandler,
        goog.events.KeyHandler.EventType.KEY,
        function(e) {
            var keyEvent = /** @type {goog.events.KeyEvent} */ (e);
            if (keyEvent.keyCode == goog.events.KeyCodes.A) {that.position[0]-=0.1;}
            else if (keyEvent.keyCode == goog.events.KeyCodes.D) {that.position[0]+=0.1;}
            else if (keyEvent.keyCode == goog.events.KeyCodes.W) {that.position[1]-=0.1;}
            else if (keyEvent.keyCode == goog.events.KeyCodes.S) {that.position[1]+=0.1;}
            else if (keyEvent.keyCode == goog.events.KeyCodes.R) {that.position[2]-=0.1;}
            else if (keyEvent.keyCode == goog.events.KeyCodes.F) {that.position[2]+=0.1;}
            console.log("New camera position", that.position[0], that.position[1], that.position[2]);
            that.rebuildViewMatrix();
        }
    );
};/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 09.03.12
 * Time: 23:01
 * To change this template use File | Settings | File Templates.
 */

goog.provide("Rendering.Demos_Demo7");
goog.require('Rendering.Demos_Interface');

goog.require("Rendering.Import.Element_Array");
goog.require("Rendering.Programs_Normal2ColorCamera");
goog.require('Rendering.Model');
goog.require("Rendering.Camera");

/**
 * @constructor
 * @implements {Rendering.Demos_Interface}
 * @param {WebGLRenderingContext}
 */
Rendering.Demos_Demo7 = function(gl) {
    /**
     * @type {Rendering.Programs_Interface}
     */
    this.program = new Rendering.Programs_Normal2ColorCamera(gl);

    /**
    * @type {?Rendering.Model}
     */
    this.model = null;
    /**
     *
     * @type {Rendering.Camera}
     */
    this.camera = new Rendering.Camera();
    this.camera.bindPositionToKeyboard();

    /**
     * @type {mat4}
     */
    this.modelView = mat4.create();
    mat4.identity(this.modelView);
    mat4.rotate(this.modelView, -Math.PI/2, [1, 0, 0]);
    mat4.scale(this.modelView, [0.1, 0.1, 0.1]);

};

/**
 * @const
 * @type {string}
 */
Rendering.Demos_Demo7.prototype.title = "Normal2color T-Rex with camera";

/**
* @param {WebGLRenderingContext}
 */
Rendering.Demos_Demo7.prototype.run = function(gl) {
    console.log("run demo 7");

    var that = this;
    var parser = new Rendering.Import.Element_Array();
    parser.load('assets/tyrannosaurus_rex/tyrannosaurus_rex_vertices.dat',
        'assets/tyrannosaurus_rex/tyrannosaurus_rex_faces.dat',
        function(vertices, normals, uvs) {
            that.model = new Rendering.Model();
            that.model.createVerticesBuffer(gl, vertices);
            if(normals) that.model.createNormalsBuffer(gl, normals);
            if(uvs) that.model.createUVsBuffer(gl, uvs);
        }
    );

    gl.useProgram(this.program.program);
};

Rendering.Demos_Demo7.prototype.stop = function() {
    console.log("stop demo 7");
    delete this.program;
    delete this.model;
    delete this.camera;
};

/**
 * @param {WebGLRenderingContext}
 */
Rendering.Demos_Demo7.prototype.frame = function(gl) {
    gl.clear(gl.COLOR_BUFFER_BIT);

    mat4.rotate(this.modelView, 1.0/180*Math.PI, [0, 0, 1]);

    gl.uniformMatrix4fv(this.program.uniforms.modelMatrix, false, this.modelView);
    gl.uniformMatrix4fv(this.program.uniforms.projectionMatrix, false, this.camera.projection);
    gl.uniformMatrix4fv(this.program.uniforms.viewMatrix, false, this.camera.view);
    if(this.model) this.program.draw(gl, this.model);
    gl.flush();
};/**
 * Created by JetBrains PhpStorm.
 * User: fridek
 * Date: 09.03.12
 * Time: 23:01
 * To change this template use File | Settings | File Templates.
 */

goog.provide("Rendering.Demos_Demo6");
goog.require('Rendering.Demos_Interface');
goog.require("Rendering.Import.Element_Array");
goog.require("Rendering.Programs_Normal2Color");
goog.require('Rendering.Model_Cube');


/**
 * @constructor
 * @implements {Rendering.Demos_Interface}
 * @param {WebGLRenderingContext}
    */
Rendering.Demos_Demo6 = function(gl) {
    /*
     * @type {Rendering.Programs_Interface}
     */
    this.program = new Rendering.Programs_Normal2Color(gl);

    /*
     * @type {Rendering.Model_Cube?}
     */
    this.model = null;

    /**
     * @type {mat4}
     */
    this.modelView = mat4.create();
    mat4.identity(this.modelView);
};


Rendering.Demos_Demo6.prototype.title = "Cube primitive";
/**
 * @param {WebGLRenderingContext}
    */
Rendering.Demos_Demo6.prototype.run = function(gl) {
    console.log("run demo 6");
    this.model = new Rendering.Model_Cube(gl, 0.5);

    gl.useProgram(this.program.program);
};

Rendering.Demos_Demo6.prototype.stop = function() {
    console.log("stop demo 6");

    delete this.model;
    delete this.modelView;
    delete this.program;
};
/**
 * @param {WebGLRenderingContext}
    */
Rendering.Demos_Demo6.prototype.frame = function(gl) {
    gl.clear(gl.COLOR_BUFFER_BIT);

    mat4.rotate(this.modelView, 1.0/180*Math.PI, [0, 0, 1]);
    mat4.rotate(this.modelView, 0.5/180*Math.PI, [0, 1, 0]);
    mat4.rotate(this.modelView, 0.75/180*Math.PI, [1, 0, 0]);
    gl.uniformMatrix4fv(this.program.uniforms.MVMatrix, false, this.modelView);

    if(this.model) this.program.draw(gl, this.model);
    gl.flush();
};goog.provide("Rendering");
goog.provide("Rendering.Runner");

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.webgl');

/**
 * tojicode gl-matrix
 */
goog.require("mat4");
goog.require("vec2");
goog.require("vec3");
goog.require("quat4");

goog.require("Rendering.Stats");
/*
goog.require("Rendering.Programs_Basic");
goog.require("Rendering.Programs_Normal2Color");
goog.require("Rendering.Programs_Texture");
goog.require("Rendering.Programs_Light_Texture");
*/

goog.require('Rendering.Demos_Demo1');
goog.require('Rendering.Demos_Demo2');
goog.require('Rendering.Demos_Demo3');
goog.require('Rendering.Demos_Demo4');
goog.require('Rendering.Demos_Demo5');
goog.require('Rendering.Demos_Demo6');
goog.require('Rendering.Demos_Demo7');
goog.require('Rendering.Demos_Demo8');
goog.require('Rendering.Demos_Demo9');
goog.require('Rendering.Demos_Demo10');
goog.require('Rendering.Demos_Demo13');
goog.require('Rendering.Demos_Demo11');
goog.require('Rendering.Demos_Demo12');
goog.require('Rendering.Demos_Demo14');


/**
 *
 * @constructor
 */
Rendering.Runner = function() {
    /**
     * fallback for browsers without requestAnimationFrame
     * which probably don't support WebGL anyway
     */
    if (!window['requestAnimationFrame']) {
        window['requestAnimationFrame'] = (function(){
            return  window['webkitRequestAnimationFrame'] ||
                window['mozRequestAnimationFrame']    ||
                window['oRequestAnimationFrame']      ||
                window['msRequestAnimationFrame']     ||
                function(/* function */ callback, /* DOMElement */ element){
                    window.setTimeout(callback, 1000 / 60);
                };
        })();
    }

    this.canvas = null;

    this.selectDemo = null;

    /**
     * @const
     * @type {Number}
     */
    this.CANVAS_WIDTH = 800;
    /**
     * @const
     * @type {Number}
     */
    this.CANVAS_HEIGHT = 400;

    this.canvas = goog.dom.createDom('canvas');
    this.canvas.width = this.CANVAS_WIDTH;
    this.canvas.height = this.CANVAS_HEIGHT;
    document.body.appendChild(this.canvas);

    this.initContext();

    this.selectDemo = goog.dom.createDom('select');
    var opt = goog.dom.createDom('option');
    opt.text = "== choose demo ==";
    opt.value = 0;
    this.selectDemo.add(opt, null);

    /*
     * @type {Rendering.Demos_Interface}
     */
    this.currentDemo = new Rendering.Demos_Demo1(this.gl);

    /**
     * @type {?Array.<Rendering.Demos_Interface>}
     */
    var demos = [
        null,
        Rendering.Demos_Demo1,
        Rendering.Demos_Demo2,
        Rendering.Demos_Demo3,
        Rendering.Demos_Demo4,
        Rendering.Demos_Demo5,
        Rendering.Demos_Demo6,
        Rendering.Demos_Demo7,
        Rendering.Demos_Demo8,
        Rendering.Demos_Demo9,
        Rendering.Demos_Demo10,
        Rendering.Demos_Demo13,
        Rendering.Demos_Demo11,
        Rendering.Demos_Demo12,
        Rendering.Demos_Demo14
    ];

    var that = this;
    goog.events.listen(this.selectDemo, goog.events.EventType.CHANGE, function() {
        if(that.currentDemo) {
            that.currentDemo.stop();
        }
        if(that.selectDemo.value == 0) {
            that.currentDemo = null;
            return;
        }
        that.currentDemo = new demos[that.selectDemo.value](that.gl);
        that.currentDemo.run(that.gl);
    }, false);

    for(var i = 1; i < demos.length; i++) {
        opt = goog.dom.createDom('option');
        opt.text = demos[i].prototype.title;
        opt.value = i;
        this.selectDemo.add(opt, null);
    }

    document.body.appendChild(this.selectDemo);
    this.currentDemo.run(this.gl);

    this.stat = new Rendering.Stats();
    this.stat.domElement.style.position = 'absolute';
    this.stat.domElement.style.top = '10px';
    this.stat.domElement.style.left = '10px';
    document.body.appendChild(this.stat.domElement);
};

Rendering.Runner.prototype.initContext = function() {
    var gl;
    try {gl = this.canvas.getContext('experimental-webgl');}
    catch(e) {alert('Exception catched in getContext: '+e.toString());return;}
    if(!gl) {alert('Unable to create Web GL context');return;}

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(goog.webgl.COLOR_BUFFER_BIT);
    gl.enable(goog.webgl.DEPTH_TEST);
    /**
     * @type {WebGLRenderingContext}
     */
    this.gl = gl;
};

Rendering.Runner.prototype.frame = function() {
    if(this.currentDemo) this.currentDemo.frame(this.gl);
    this.stat.update();
    window['requestAnimationFrame'](this.frame);
};

window.addEventListener("load", function() {
    var runner = new Rendering.Runner();
    runner.frame = runner.frame.bind(runner);
    window['requestAnimationFrame'](runner.frame);
});