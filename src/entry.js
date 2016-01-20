require('../less/main.less');

'use strict';

import React, { PropTypes } from "react";
import ReactDOM from "react-dom";
import GitLabCenterApp from './GitLabCenterApp';

var ipc = electronRequire('ipc');

ReactDOM.render(
  <GitLabCenterApp />
, document.getElementById("content"));