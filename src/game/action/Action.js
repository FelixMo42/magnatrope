import GameObject from "../object/GameObject";
import Effect from "./Effect";

export default class Action extends GameObject {
    constructor(config) {
        super(config)

        this.addVariable({
            name: "player",
            setter: false,
            required: true
        })

        // the name of the action
        this.addVariable({
            name: "name"
        })

        // the max range of the action
        this.addVariable({
            name: "range",
            default: 1
        })

        // cost of using the action
        this.addVariable({
            name: "cost",
            default: {}
        })

        // default style of effect
        this.addVariable({
            name: "defaultStyle",
            default: "ball"
        })

        // default size of effect
        this.addVariable({
            name: "defaultSize",
            default: 1
        })

        // list of effects the action has
        this.addVariable({
            name: "effects",
            setter: false
        })

        this.addVariable({
            name: "requirments",
            default: {}
        })
    }

    /// ///

    /**
     * 
     */
    getQueue(flip) {
        return this.getPlayer(flip).getQueue(flip)
    }

    /// ///

    getMap(flip) {
        return this.getPlayer(flip).getMap(flip)
    }

    /**
     * 
     * @param {boolean} flip 
     */
    getPosition(flip) {
        return this.getPlayer(flip).getPosition(flip)
    }

    /**
     * 
     * @param {boolean} flip 
     */
    getNode(flip) {
        return this.getPlayer(flip).getNode(flip)
    }

    /**
     * 
     * @param {boolean} flip 
     */
    getTile(flip) {
        return this.getPlayer(flip).getTile(flip)
    }

    /// ///

    /**
     * 
     * @param {Vec2} position 
     */
    cheak(target) {
        if (this.getPosition().distanceFrom(target) > this.getRange() + .5) {
            return false
        }

        for (var move in this.getCost().moves) {
            if (this.getPlayer().getMove(move) + this.getCost().moves[move] < 0) {
                return false
            }
        }

        if ("walkable" in this.getRequirments()) {
            if (this.getRequirments().walkable !== this.getMap().getNode(target).isWalkable()) {
                return false
            }
        }

        return true
    }

    /**
     * 
     * @param {Vec2} flip 
     */
    use(position) {
        if (!this.cheak(position)) {
            console.debug(this.getPlayer().getName() + " failed to use " + this.getName() + " on " + position)
            return false
        }

        console.debug(this.getPlayer().getName() + " uses " + this.getName() + " on " + position)

        // apply cost
        new Effect({
            style: "cost",
            playerEffect: this.getCost(),
            target: this.getPosition(),
            source: this
        })

        // apply effects
        for (var effect of this.getEffects()) {
            new Effect({
                ...effect,
                target: position,
                source: this
            })
        }

        return true
    }
}