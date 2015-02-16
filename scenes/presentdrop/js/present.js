goog.provide('app.Present');

goog.require('app.shared.pools');

/**
 * Drops a present.
 * @constructor
 * @param {!app.Game} game The current game object.
 */
app.Present = function(game) {
  this.game = game;
  this.elem = $('<div class="present hidden" />');
  game.presentsElem.append(this.elem);
};

app.shared.pools.mixin(app.Present);

/**
 * Resets the present for reuse.
 * @param {number} x The X position.
 */
app.Present.prototype.onInit = function(x) {
  this.elem.removeClass('hidden');
  this.dead = false;

  // State
  this.x = x - app.Present.PRESENT_CENTER;
  this.y = app.Constants.PRESENT_START_Y;
  this.velocity = app.Constants.PRESENT_INITIAL_VELOCITY;
  this.elem.css('left', this.x + 'px');
  this.draw();
};

/**
 * Remove present from pool.
 */
app.Present.prototype.remove = function() {
  app.Present.push(this);
};

/**
 * Remove the present from the dom and game loop.
 */
app.Present.prototype.onDispose = function() {
  this.elem.addClass('hidden');
  this.dead = true;
};

/**
 * Position the present.
 */
app.Present.prototype.draw = function() {
  this.elem.css('top', this.y + 'px');
};

/**
 * Moves the present each frame.
 * @param {number} delta time in seconds since last frame.
 */
app.Present.prototype.onFrame = function(delta) {
  var lasty = this.y, present = this;

  // Calculate gravity
  if (this.y < app.Constants.PRESENT_END_Y) {
    this.velocity += app.Constants.PRESENT_GRAVITY * delta;
    this.y += this.velocity * delta;
    if (this.y > app.Constants.PRESENT_END_Y) {
      this.y = app.Constants.PRESENT_END_Y;
    }
  } else {
    present.remove();
    window.santaApp.fire('sound-trigger', 'pd_item_miss');
  }

  // Collition detection
  this.game.forEachActiveChimney(function(chimney) {
    var hitbox = chimney.getHitbox();

    // Check vertical hit
    if (hitbox.y <= lasty || hitbox.y >= present.y) {
      return;
    }

    // Check for horizontal hit
    var diff = Math.abs(present.x - hitbox.x - hitbox.center);

    if (diff <= hitbox.center - app.Present.PRESENT_CENTER) {
      // Hits inside chimney.
      present.remove();
      chimney.hit();

    } else if (diff < hitbox.center + app.Present.PRESENT_CENTER) {
      // Hits on edge. Should bounce away?
      present.remove();
      chimney.hit();
    }
  });

  this.draw();
};

/**
 * Drop a present.
 * @param {number} x The x location of the present.
 */
app.Present.prototype.drop = function(x) {
  this.elem.addClass('drop');
  this.elem.css({left: (x - app.Present.PRESENT_CENTER) + 'px'});
  this.elem.appendTo(this.elem.closest('.stage').find('.presents'));
};

/** @const */
app.Present.PRESENT_CENTER = app.Constants.PRESENT_WIDTH / 2;
