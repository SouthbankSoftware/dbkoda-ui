"use strict";

const CommonJsRequireDependency = require("webpack/lib/dependencies/CommonJsRequireDependency");
const fs = require("fs");
const path = require("path");
const SkipAMDPlugin = require("skip-amd-webpack-plugin");
const util = require("./util");

/**
 * Development Mode:
 * - Automatically loads CLDR data (i.e., injects `Globalize.load(<necessary CLDR data>)`).
 * - Automatically define default locale (i.e., injects `Globalize.locale(<defaultLocale>)`).
 */
class DevelopmentModePlugin {
  constructor(attributes) {
    let i18nDataTemplate;
    const cldr = attributes.cldr || util.cldr;
    const timeZoneData = attributes.timeZoneData || util.timeZoneData;
    const tmpdirBase = attributes.tmpdirBase || ".";
    const tmpdir = util.tmpdir(tmpdirBase);

    const messagesPath =  path.resolve(attributes.messages.replace("[locale]", attributes.developmentLocale));

    i18nDataTemplate = [
      "var messages = require(\"" + messagesPath + "\");",
      "",
      "var Globalize = require(\"globalize\");",
      "",
      `Globalize.load(${JSON.stringify(cldr(attributes.developmentLocale))});`,
      messagesPath ? [
        "Globalize.loadMessages(messages);",
        "if (module.hot) {",
        "  Globalize.loadMessages(messages);",
        "  module.hot.accept();",
        "}",
      ].join("\n") : "",
      `Globalize.loadTimeZone(${JSON.stringify(timeZoneData())});`,
      `Globalize.locale(${JSON.stringify(attributes.developmentLocale)});`,
      "",
      "module.exports = Globalize;"
    ].join("\n");

    this.i18nData = path.join(tmpdir, "dev-i18n-data.js");
    this.moduleFilter = util.moduleFilterFn(attributes.moduleFilter);
    fs.writeFileSync(this.i18nData, i18nDataTemplate);
  }

  apply(compiler) {
    // Skip AMD part of Globalize Runtime UMD wrapper.
    compiler.apply(new SkipAMDPlugin(/(^|[\/\\])globalize($|[\/\\])/));

    // "Intercepts" all `require("globalize")` by transforming them into a
    // `require` to our custom generated template, which in turn requires
    // Globalize, loads CLDR, set the default locale and then exports the
    // Globalize object.
    compiler.plugin("compilation", (compilation, params) => {
      params.normalModuleFactory.plugin("parser", (parser) => {
        parser.plugin("call require:commonjs:item", (expr, param) => {
          const request = parser.state.current.request;

          if(param.isString() && param.string === "globalize" && this.moduleFilter(request) &&
            !(new RegExp(util.escapeRegex(this.i18nData))).test(request)) {

            const dep = new CommonJsRequireDependency(this.i18nData, param.range);
            dep.loc = expr.loc;
            dep.optional = !!parser.scope.inTry;
            parser.state.current.addDependency(dep);

            return true;
          }
        });
      });
    });
  }
}

module.exports = DevelopmentModePlugin;
