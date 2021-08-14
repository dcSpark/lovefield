/**
 * @license
 * Copyright 2015 The Lovefield Project Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
goog.provide('lf.proc.ResetTask');

goog.require('goog.Promise');
goog.require('lf.TransactionType');
goog.require('lf.cache.Prefetcher');
goog.require('lf.proc.Task');
goog.require('lf.proc.TaskPriority');
goog.require('lf.service');
goog.require('lf.structs.set');
 
  
/**
 * Resets the Lovefield cache
 * @implements {lf.proc.Task}
 * @constructor
 * @struct
 *
 * @param {!lf.Global} global
 * @param {!lf.proc.Database} database
 * @param {!lf.schema.ConnectOptions=} opt_options
 */
lf.proc.ResetTask = function(global, database, opt_options) {
  /** @private {!lf.Global} */
  this.global_ = global;

  /** @private {!lf.proc.Database} */
  this.database_ = database;

  /** @private {?lf.schema.ConnectOptions} */
  this.opt_options_ = opt_options || null;

  /** @private {!lf.structs.Set<!lf.schema.Table>} */
  this.scope_ = lf.structs.set.create(this.database_.getSchema().tables());

  /** @private {!goog.promise.Resolver<!Array<!lf.proc.Relation>>} */
  this.resolver_ = goog.Promise.withResolver();

};


/** @override */
lf.proc.ResetTask.prototype.exec = function() {
  if (!this.database_.isOpen()) {
    return goog.Promise.resolve();
  }
  this.database_.close();

  return this.database_.init(this.opt_options_ || undefined).then(
    function(db) {
      return db;
    }.bind(this),
    function(e) {
      this.database_.close();
      throw e;
    }.bind(this));
};


/** @override */
lf.proc.ResetTask.prototype.getType = function() {
  return lf.TransactionType.READ_WRITE;
};


/** @override */
lf.proc.ResetTask.prototype.getScope = function() {
  return this.scope_;
};


/** @override */
lf.proc.ResetTask.prototype.getResolver = function() {
  return this.resolver_;
};


/** @override */
lf.proc.ResetTask.prototype.getId = function() {
  return goog.getUid(this);
};


/** @override */
lf.proc.ResetTask.prototype.getPriority = function() {
  return lf.proc.TaskPriority.RESET_TASK;
};
