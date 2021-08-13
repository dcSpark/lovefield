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
goog.provide('lf.proc.ResetCacheTask');

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
  */
 lf.proc.ResetCacheTask = function(global) {
   /** @private {!lf.Global} */
   this.global_ = global;
 
   /** @private {!lf.schema.Database} */
   this.schema_ = global.getService(lf.service.SCHEMA);
 
   /** @private {!lf.structs.Set<!lf.schema.Table>} */
   this.scope_ = lf.structs.set.create(this.schema_.tables());
 
   /** @private {!goog.promise.Resolver<!Array<!lf.proc.Relation>>} */
   this.resolver_ = goog.Promise.withResolver();
 
   /** @private {!lf.cache.Cache} */
   this.cache_ = global.getService(lf.service.CACHE);
 
   /** @private {!lf.index.IndexStore} */
   this.indexStore_ = global.getService(lf.service.INDEX_STORE);
 };
 
 
 /** @override */
 lf.proc.ResetCacheTask.prototype.exec = function() {
    this.indexStore_.clear();
    this.cache_.clear();
    this.cache_.init(this.schema_);
    return this.indexStore_.init(this.schema_).then(function() {
        var prefetcher = new lf.cache.Prefetcher(this.global_);
        return prefetcher.init(this.schema_);
    }.bind(this))
 };
 
 
 /** @override */
 lf.proc.ResetCacheTask.prototype.getType = function() {
   return lf.TransactionType.READ_WRITE;
 };
 
 
 /** @override */
 lf.proc.ResetCacheTask.prototype.getScope = function() {
   return this.scope_;
 };
 
 
 /** @override */
 lf.proc.ResetCacheTask.prototype.getResolver = function() {
   return this.resolver_;
 };
 
 
 /** @override */
 lf.proc.ResetCacheTask.prototype.getId = function() {
   return goog.getUid(this);
 };
 
 
 /** @override */
 lf.proc.ResetCacheTask.prototype.getPriority = function() {
   return lf.proc.TaskPriority.RESYNC_CACHE_TASK;
 };
 