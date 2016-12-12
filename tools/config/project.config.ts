import { join } from 'path';

import { SeedConfig } from './seed.config';
// import { ExtendPackages } from './seed.config.interfaces';

/**
 * This class extends the basic seed configuration, allowing for project specific overrides. A few examples can be found
 * below.
 */
export class ProjectConfig extends SeedConfig {

  PROJECT_TASKS_DIR = join(process.cwd(), this.TOOLS_DIR, 'tasks', 'project');

  // @doc: https://github.com/mgechev/angular-seed/wiki/Add-external-fonts
  FONTS_DEST = `${this.APP_DEST}/fonts`;
  FONTS_SRC = [
    'node_modules/bootstrap/dist/fonts/**',
    'src/client/fonts/montserrat/**'
  ];

  constructor() {
    super();
    this.APP_TITLE = 'Spotnic - Votre place de stationnement en quelques clics';

    /* Enable typeless compiler runs (faster) between typed compiler runs. */
    // this.TYPED_COMPILE_INTERVAL = 5;

    // Add `NPM` third-party libraries to be injected/bundled.
    // @doc: https://github.com/mgechev/angular-seed/wiki/Add-external-scripts-and-styles
    this.NPM_DEPENDENCIES = [
      ...this.NPM_DEPENDENCIES,
      {src: 'jquery/dist/jquery.min.js', inject: 'libs'}, // Uncommented line from angular-seed
      {src: 'moment/moment.js', inject: 'libs'},
      {src: 'moment/locale/fr.js', inject: 'libs'},
      {src: 'bootstrap/js/transition.js', inject: 'libs'},
      {src: 'bootstrap/js/collapse.js', inject: 'libs'},
      {src: 'bootstrap/dist/js/bootstrap.min.js', inject: 'libs'},
      {src: 'bootstrap/dist/css/bootstrap.min.css', inject: true},
      // {src: 'ng2-tooltip/index.js', inject: 'libs'},
      {src: 'eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js', inject: true},
      {src: 'eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css', inject: true},
    ];

    // Add `local` third-party libraries to be injected/bundled.
    this.APP_ASSETS = [
      ...this.APP_ASSETS,
      // // {src: `${this.APP_SRC}/your-path-to-lib/libs/jquery-ui.js`, inject: true, vendor: false}
      // // {src: `${this.APP_SRC}/temp/bootstrap-datetimepicker.js`, inject: true, vendor: true},
      // // {src: `${this.APP_SRC}/temp/bootstrap-datetimepicker.min.css`, inject: true, vendor: false},
      {src: `${this.CSS_SRC}/icomoon.css`, inject: true, vendor: false},
      {src: `${this.CSS_SRC}/magic-check.css`, inject: true, vendor: false},
      // // {src: `${this.APP_SRC}/temp/lock.min.js`, inject: true, vendor: false},
    ];

    this.mergeObject(this.SYSTEM_CONFIG_DEV.paths, {
      'moment': 'node_modules/moment/moment.js',
      'ng2-tooltip': 'node_modules/ng2-tooltip/index.js',
      'ng2-bs3-modal': 'node_modules/ng2-bs3-modal',
      'angular2-jwt': 'node_modules/angular2-jwt/angular2-jwt.js',
      // // 'auth0-lock': 'node_modules/auth0-lock/lib/index.js',
    });

    this.SYSTEM_CONFIG = this.SYSTEM_CONFIG_DEV;

    this.mergeObject(this.SYSTEM_BUILDER_CONFIG.packages, {
      'angular2-jwt': { main: 'angular2-jwt.js', defaultExtension: 'js' },
      'moment': { main: 'moment.js', defaultExtension: 'js' },
      'ng2-tooltip': { main: 'index.js', defaultExtension: 'js' },
      // // 'auth0-lock' : { main: 'index.js', defaultExtension: 'js' },
    });

    // Add packages (e.g. lodash)
    // let additionalPackages: ExtendPackages[] = [{
    //   name: 'lodash',
    //   path: `${this.APP_BASE}node_modules/lodash/lodash.js`,
    //   packageMeta: {
    //     main: 'index.js',
    //     defaultExtension: 'js'
    //   }
    // }];
    //
    // or
    //
    // let additionalPackages: ExtendPackages[] = [];
    //
    // additionalPackages.push({
    //   name: 'lodash',
    //   path: `${this.APP_BASE}node_modules/lodash/lodash.js`,
    //   packageMeta: {
    //     main: 'index.js',
    //     defaultExtension: 'js'
    //   }
    // });
    //
    // this.addPackagesBundles(additionalPackages);

    /* Add to or override NPM module configurations: */
    // this.mergeObject(this.PLUGIN_CONFIGS['browser-sync'], { ghostMode: false });
  }

}
