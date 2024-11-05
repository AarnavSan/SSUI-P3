import { Err } from "./Err.js";
import { Check } from "./Check.js";
const evtTypeStrings = ['press', 'release', 'release_none', 'enter', 'exit',
    'move_inside', 'any', 'nevermatch'];
//. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
export class EventSpec {
    constructor(evtTyp, regionName) {
        this._evtType = evtTyp;
        this._regionName = regionName;
        this._region = undefined; // will be bound once full FSM is provided
    }
    // Construct an EventSpec from an EventSpec_json object, checking all the parts 
    // (since data coming from json parsing lives in javascript land and may not actually 
    // be typed at runtime as we think/hope it is).
    static fromJson(evt) {
        const evtType = Check.limitedString(evt.evtType, evtTypeStrings, "nevermatch", "EventSpec.fromJson{evtType:}");
        const region = Check.stringVal(evt.region, "EvtType.fromJson{region:}");
        return new EventSpec(evtType, region);
    }
    get evtType() { return this._evtType; }
    get regionName() { return this._regionName; }
    get region() { return this._region; }
    //-------------------------------------------------------------------
    // Methods
    //------------------------------------------------------------------- 
    // Attempt to find the Region object corresponding to our named region within
    // the given list of regions, and assign that to this._region.  If the region
    // name is "*" or the region is not found, _region is set to undefined.
    bindRegion(regionList) {
        // look for the wildcard
        if (this._regionName === "*") {
            this._region = undefined;
            return;
        }
        // **** YOUR CODE HERE ****=
        // Find the region in the regionList and assign it to _region
        for (let reg of regionList) {
            //if region name matches the name of the region in the list assign it to _region
            if (this._regionName === reg.name) {
                //assign the region to _region
                this._region = reg;
                //return if region is found
                return;
            }
        }
        // if we get here, we didn't find a matching region
        //So we set _region to undefined
        this._region = undefined;
        // we didn't match any region, that's ok for some forms that don't need a region
        if (this.evtType === 'nevermatch')
            return;
        if ((this.evtType === 'release_none' || this.evtType === 'any') &&
            this._regionName === "") {
            return;
        }
        Err.emit(`Region '${this._regionName}'` +
            ' in event specification does not match any region.');
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Method to perform a match against an actual event.  The event is represented 
    // by an event type (evtType) and an optional associated region (regn).  If 
    // our region is undefined and region name is "*", we will match to any region.
    match(evtType, regn) {
        // **** YOUR CODE HERE ****
        // Check if the event matches this EventSpec or if event type is any
        if (this._evtType === evtType || this._evtType === 'any') {
            //if region is undefined match to any region
            if (!(this.region)) {
                return true;
            }
            //if region is * or region matches the name return true
            if (this._regionName === "*" || this._regionName === (regn === null || regn === void 0 ? void 0 : regn.name)) {
                return true;
            }
        }
        return false;
    }
    //-------------------------------------------------------------------
    // Debugging Support
    //-------------------------------------------------------------------
    // Create a short human readable string representing this object for debugging
    debugTag() {
        return `EventSpec(${this.evtType} ${this.regionName})`;
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Create a human readable string displaying this object for debugging purposes
    debugString(indent = 0) {
        let result = "";
        const indentStr = '  '; // two spaces per indent level
        // produce the indent
        for (let i = 0; i < indent; i++)
            result += indentStr;
        result += `${this.evtType} ${this.regionName}`;
        if (!this.region)
            result += " unbound";
        return result;
    }
    //. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
    // Log a human readable display of this object to the console
    dump() {
        console.log(this.debugString());
    }
} // end class EventSpec 
//===================================================================
//# sourceMappingURL=EventSpec.js.map