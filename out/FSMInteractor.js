//===================================================================
// Finite State Machine driven interactor v1.0a 10/2023
// by Scott Hudson, CMU HCII 
//
// This and accompanying files provides classes and types which implement a generic
// interactor whose appearance and behavior is controlled by a Finite State Machine (FSM), 
// along with a set of "regions" which determine its appearance, as well as how 
// high-level input events for it are synthized and dispatched. See the comments
// in various classes for details.
//
// Revision history
// v1.0a  Initial version                 Scott Hudson  10/23
//
//===================================================================
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { FSM } from "./FSM.js";
import { Err } from "./Err.js";
//===================================================================
// Class for an interactive object controlled by a finite state machine (FSM).
// Objects of this class have a position on the screen (the location of their top-left
// corner within the HTML canvas object associated with thier parent (Root) object), 
// Along with an FSM object which specifies, and partially imlements, their behavior.
// This class is repsonsible for using the FSM object to draw all the current region 
// images within the FSM, and for dispatching events to the FSM to drive its behavior.
// Note that this object has a position, but not an explicit size, and that no clipping
// of its output is being done.  Regions within the FSM are positioned in the coordinate
// system of this object (i.e., WRT its top-left corner), and have a size that 
// establishes a bouding box for input purposes (i.e., indicateing which event positions 
// are considered "inside" or "over" the region for input purposes).  However, region 
// image displays are not not limited to that bounding box and are not clipped (except 
// by the containing HTML canvas object).  See the FSM and Root classes for more details.
//=================================================================== 
export class FSMInteractor {
    constructor(fsm = undefined, x = 0, y = 0, parent) {
        //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
        // **** YOUR CODE HERE ****   
        // Persistent bookkeeping for dispatchRawEvent
        this._lastRegions = [];
        this._pressedRegion = null;
        this._fsm = fsm;
        this._x = x;
        this._y = y;
        this._parent = parent;
        if (fsm)
            fsm.parent = this;
    }
    get x() { return this._x; }
    set x(v) {
        var _a;
        // **** YOUR CODE HERE ****
        //If the x position is not equal to the new value, set the x position to the new value and call damage
        if (this._x != v) {
            this._x = v;
            (_a = this.parent) === null || _a === void 0 ? void 0 : _a.damage;
        }
    }
    get y() { return this._y; }
    set y(v) {
        var _a;
        // **** YOUR CODE HERE ****
        //If the y position is not equal to the new value, set the y position to the new value and call damage
        if (this._y != v) {
            this._y = v;
            (_a = this.parent) === null || _a === void 0 ? void 0 : _a.damage;
        }
    }
    // Position treated as a single value
    get position() {
        return { x: this.x, y: this.y };
    }
    set position(v) {
        var _a;
        if ((v.x !== this._x) || (v.y !== this._y)) {
            this._x = v.x;
            this._y = v.y;
            (_a = this.parent) === null || _a === void 0 ? void 0 : _a.damage;
        }
    }
    get parent() { return this._parent; }
    set parent(v) {
        // **** YOUR CODE HERE ****
        //If the parent is not undefined, set the parent to the new value
        if (!(typeof v == undefined)) {
            if (this._parent != v) {
                this._parent = v;
                this.damage();
            }
        }
    }
    get fsm() { return this._fsm; }
    //-------------------------------------------------------------------
    // Methods
    //-------------------------------------------------------------------
    // Declare that something managed by this object (most typically a region image, 
    // position, or size within the underlying FSM) has changed in a way that may 
    // make the current display incorrect and in need of update.  This is normally called 
    // from the controlling FSM, in response to damage declarations from its  "child" 
    // regions, etc.  This method passes the damage notification to its hosting Root
    // object which coordinates eventual redraw by calling this object's draw() method.
    damage() {
        var _a;
        // **** YOUR CODE HERE ****
        //Pass damage upwards by calling damage in the parent
        (_a = this.parent) === null || _a === void 0 ? void 0 : _a.damage();
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Draw the display for this object using the given drawing context object.  If the
    // showDegugging parameter is passed as true, additional drawing for debugging 
    // purposes (e.g., a black frame showing the bounding box of every region) is 
    // requsted.  See Region.draw() for more details.
    draw(ctx, showDebugging = false) {
        // bail out if we don't have an FSM to work from
        if (!this.fsm)
            return;
        // **** YOUR CODE HERE ****
        this.fsm.regions.forEach(region => {
            // save the state of the drawing context
            ctx.save();
            // translate the drawing context to the region's position
            ctx.translate(region.x, region.y);
            // draw the region
            region.draw(ctx, showDebugging);
            // restore the drawing context to its previous state
            ctx.restore();
        });
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Perform a "pick" operation, to determine the list of regions in our controlling
    // FSM which the given point is to be considered "inside" of or "over" (i.e., that
    // the given point is within the bounding box of).  The position passed here must 
    // be in the local coordinate system of this object (i.e., the position 0,0 would 
    // be at the top-left of this object).  Note that the "pick list" returned here
    // is ordered in reverse regions drawing order (regions drawn later, appear
    // earlier in the list) so that the region drawn on top of other objects appear
    // before them in the list.
    pick(localX, localY) {
        let pickList = [];
        // if we have no FSM, there is nothing to pick
        if (!this.fsm)
            return pickList;
        // **** YOUR CODE HERE ****
        //Iterate through the regions in the FSM and add the regions that contain the point to the pickList
        for (let i = this.fsm.regions.length - 1; i >= 0; i--) {
            //If the point is inside the region, add it to the pickList
            //Get the current region
            let currentRegion = this.fsm.regions[i];
            //Calculate the local coordinates of the point
            let childX = localX - currentRegion.x;
            let childY = localY - currentRegion.y;
            //If the point is inside the region, add it to the pickList
            if (currentRegion.pick(childX, childY)) {
                pickList.push(currentRegion);
            }
        }
        //Return the pickList
        return pickList;
    }
    // Dispatch the given "raw" event by translating it into a series of higher-level
    // events which are formulated in terms of the regions of our FSM.  "Raw" events 
    // are based on simple actions with the input device(s) -- currently just press and
    // release of the first/primary locator button, and locator moves.  "Raw" events are 
    // represented by one of those three event types along with a position (in the local
    // coordinates of this object).  
    //
    // The following higher-level events are generated as translations of a "raw" event:
    // exit <region>, enter <region>, press <region>, move_inside <region>, 
    // release <region>, and release_none.  Multiple of these high level events can be 
    // generated from one "raw" event.  For example, an underlying move event can 
    // generate exit, enter, and move_inside events for multiple regions.  The order
    // of event delivery is to first deliver all exit events, then all enter events, etc.
    // in the order listed above.  Within each event type, events associated with the 
    // last drawn region should be dispatched first (i.e., events are delivered in 
    // reverse region drawing order). Note that all generated higher-level events
    // are dispatched to the FSM (via its actOnEvent() method).
    dispatchRawEvent(what, localX, localY) {
        // if we have no FSM, there is nothing to dispatch to
        if (this.fsm === undefined)
            return;
        // **** YOUR CODE HERE ****
        //Get the regions that contain the point
        const regions = this.pick(localX, localY);
        //Iterate through the regions and dispatch the appropriate events
        //Dispatch exit events
        for (const region of this._lastRegions) {
            if (!regions.includes(region)) {
                this.fsm.actOnEvent('exit', region);
            }
        }
        //Dispatch enter events
        for (const region of regions) {
            if (!this._lastRegions.includes(region)) {
                this.fsm.actOnEvent('enter', region);
            }
        }
        //Dispatch press events
        if (what === 'press') {
            for (const region of regions) {
                this.fsm.actOnEvent('press', region);
                this._pressedRegion = region;
            }
        }
        //Dispatch move_inside events
        if (what === 'move') {
            for (const region of regions) {
                this.fsm.actOnEvent('move_inside', region);
            }
        }
        //Dispatch release events
        if (what === 'release') {
            for (const region of regions) {
                this.fsm.actOnEvent('release', region);
            }
        }
        //Dispatch release_none events
        if (what === 'release' && regions.length === 0) {
            this.fsm.actOnEvent('release_none');
        }
        this._lastRegions = regions;
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Method to begin an asychnous load of a FSM_json object from a remotely loaded 
    // .json file.  This object is then transformed into an FSM object to control
    // this object.  This method starts the loading process and sets up follow-on 
    // (asynchonous) actions, but then immediately returns.  In the asynchronous follow-on
    // actios, if the loading fails, Err.emit() is called with an appropriate message, 
    // and this._fsm is set to undefined.  When/if loading completes, the data is 
    // unpacked into an FSM_json object which is in turn used by FSM.fromJson() to create 
    // an FSM object installed as our fsm property.  Finally we declare damage to our 
    // parent object to arrange for redraw with the newly installed FSM.
    startLoadFromJson(jsonLoc) {
        return __awaiter(this, void 0, void 0, function* () {
            // try to load the json text from the given location
            const response = yield fetch(jsonLoc);
            if (!response.ok) {
                Err.emit(`Load of FSM from "${jsonLoc}" failed`);
                this._fsm = undefined;
                return;
            }
            //  parse the json into an (alledged) FSM_json object
            const data = yield response.json();
            // validate and build an actual FSM object out of that
            this._fsm = FSM.fromJson(data, this);
            // we just changed everything, so declare damage
            this.damage();
        });
    }
} // end class FSMInteractor 
//===================================================================
//# sourceMappingURL=FSMInteractor.js.map