require('../less/main.less');
//require('bootstrap.css');
require('../node_modules/bootstrap/dist/css/bootstrap.min.css');
require('../node_modules/font-awesome/css/font-awesome.min.css');
require('../node_modules/bootstrap/dist/js/bootstrap.js');

'use strict';

import React, { PropTypes } from "react";
import ReactDOM from "react-dom";
import GitLabCenterApp from './GitLabCenterApp';

var ipc = electronRequire('ipc');

ReactDOM.render(
  <GitLabCenterApp />
, document.getElementById("content"));