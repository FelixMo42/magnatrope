import GameObject from "../object/GameObject"
import NodeComponent from "../object/NodeComponent";
import Game from "../Game";
import Draw from "../util/Draw";
import Action from "../action/Action";
import HealthComponent from "../object/HealthComponent";
import Item from "../item/Item";
import Slot from "./Slot";
import Pather from "../util/Pather";

export default class Player extends GameObject.uses(
    HealthComponent, NodeComponent
) {
    constructor(config={}) {
        super(config)

        this.stack = []
        this.itemData = {}

        this.addVariable({
            name: "turn",
            getterName: "isTurn",
            setter: false,
            default: false
        })

        this.addVariable({
            name: "name"
        })

        this.addVariable({
            name: "MP",
            default: 100
        })

        this.addVariable({
            name: "controller",
            default: "robot"
        })

        this.addVariable({
            name: "color",
            default: "blue"
        })

        //TODO: more unified move type list

        this.addVariable({
            name: "maxMoves",
            default: {},
            setter: false,
            init: (state) => {
                return {
                    "main": 5,
                    ...state
                }
            }
        })

        this.addVariable({
            name: "moves",
            default: {},
            init: (state) => {
                return {
                    ...this.getMaxMoves(),
                    ...state
                }
            }
        })

        this.addVariable({
            name: "itemBooks",
            default: {}
        })

        this.addVariable({
            name: "actions",
            setter: false,
            init: (states) => {
                var actions = []
                
                for (var state of states) {
                    if (state.itemTypes) {
                        for (var itemType of state.itemTypes) {
                            this.addItemBookAction(itemType, state)
                        }
                    } else {
                        actions.push(new Action({
                            ...state,
                            player: this
                        }))
                    }
                }

                return actions
            }
        })

        this.addVariable({
            name: "items",
            setter: false,
            default: [],
            init: (states) => {
                var items = []

                for (var state of states) {
                    items.push(new Item({
                        ...state,
                        player: this
                    }))
                }

                return items
            }
        })

        this.addVariable({
            name: "slots",
            setter: false,
            default: {
                head: {
                    name: "head",
                    spots: 1
                },
                hand: {
                    name: "hands",
                    spots: 2
                },
            },
            init: (states) => {
                var slots = {}

                for (var state in states) {
                    slots[state] = new Slot(states[state])
                }

                return slots
            }
        })

        this.addCallback({
            name: "startTurnCallback"
        });

        this.addCallback({
            name: "endTurnCallback"
        });

        // register callbacks

        Game.getInstance().registerUpdateCallback((dt) => this.processStack(dt))
    }

    /**
     * 
     * @param {PlayerEffect} effect 
     */
    affect(effect) {
        if (effect.hasHP()) {
            this.damage(effect.getHP())
        }

        if (effect.hasPull()) {
            this.move(effect.getTargetPositon(), effect.getQueue()) //TODO: make it not teleportation
        }

        if (effect.hasPush()) {
            console.log(effect.getPush()) //TODO: make it
        }

        if (effect.hasMoves()) {
            this.useMoves(effect.getMoves(), effect.getQueue())
        }
    }

    move(position, queue) {
        console.debug(this.getName() + " moves to " + position)

        var map = this.getMap()
        this.getNode().removePlayer(queue)
        map.getNode(position).setPlayer(this, queue)
    }

    die(queue) {
        console.debug(this.getName() + " died!")

        if (this.isTurn()) {
            this.endTurn(queue)
        }

        this.getMap().removePlayer(this, queue)
    }

    /// turn ///

    /**
     * 
     */
    startTurn() {
        console.debug(this.getName() + " starts their turn")

        this.set("turn", true)
        this.setMoves({...this.getMaxMoves()})

        if (this.getController() !== "player") {
            this.doTurn()
            this.pushToStack(
                () => {
                    this.endTurn()
                }
            )
        }

        this.callStartTurnCallback(this)
    }

    doTurn() {
        var players = this.getMap().getPlayers()
        
        var enemies = []
        var allies = []
        var neutral = []

        for (var player of players) {
            if (player === this) {
                continue
            }

            var relationship = this.relationship(player)

            if (relationship > 0) {
                allies.push(player)
            }
            if (relationship === 0) {
                neutral.push(player)
            }
            if (relationship < 0) {
                enemies.push(player)
            }
        }

        var whatToDo = "fight"

        //console.log(whatToDo, enemies[0])

        if (whatToDo === "stay") {
        }

        if (whatToDo === "fight") {
            var sucses;
            var target = enemies[0]
        
            if (target === undefined) {
                return
            }

            // move to target
            while (true) {
                sucses = this.getAction("Move").use(
                    this.getPosition().add(target.getPosition().subtract(this.getPosition()).sign())
                )
                if (!sucses) {
                    break
                }
            }

            // attack target
            while (true) {
                sucses = this.getAction("Punch").use(
                    target.getPosition()
                )
                if (!sucses || target.isDead()) {
                    break
                }
            }
        }

        if (whatToDo === "run") {
        }
    }

    /**
     * 
     */
    endTurn(queue) {
        if (!this.isTurn()) {
            return
        }

        console.debug(this.getName() + " ends their turn")

        this.set("turn", false, this.stack)

        this.getMap().nextTurn()

        this.callEndTurnCallback(this)
    }

    /**
     * 
     * @param {Player} player 
     * @param {boolean} flip 
     */
    relationship(player, flip) {
        return -1
    }

    /// items ///

    storeItem(item, queue) {
        this.appendArrayItem("items", item, queue)
    }

    removeItem(item, queue) {
        this.removeArrayItem("items", item, queue)
    }

    equipItem(item, slots, queue) {
        for (let slot in slots) {
            this.getSlot(slot).addItem(item, slots[slot], queue)
        }

        if (item.hasType() && this.hasItemBook(item.getType())) {
            for (let actionState of this.getItemBook(item.getType())) {
                let action = new Action({
                    ...actionState,
                    item: item,
                    player: this
                })
                
                this.addAction(action, queue)

                let callback = () => {
                    this.removeAction(action)
                    item.deregisterUnequipCallback(callback)
                }
                item.registerUnequipCallback(callback)
            }
        }
    }

    unequipItem(item, slots, queue) {
        for (let slot in slots) {
            this.getSlot(slot).removeItem(item, slots[slot], queue)
        }
    }

    getSlot(slot, flip) {
        return this.getSlots(flip)[slot]
    }

    /// moves and actions ///

    getMove(move, flip) {
        return this.getMoves(flip)[move]
    }

    useMoves(moves, queue) {
        for (var move in moves) {
            this.setMove(move, this.getMove(move) + moves[move], queue)
        }
    }

    setMove(move, value, queue) {
        this.setArrayItem("moves",move,value, queue)
    }

    getMaxMove(move, flip) {
        return this.getMaxMoves(flip)[move]
    }

    getAction(name) {
        for (var action of this.getActions()) {
            if (action.getName() === name) {
                return action
            }
        }
    }

    addAction(action, queue) {
        this.appendArrayItem("actions", action, queue)
    }

    removeAction(action, queue) {
        this.removeArrayItem("actions", action, queue)
    }

    addItemBookAction(itemType, action, queue) {
        this.mirror((data, mode) => {
            if (!(itemType in data.itemBooks)) {
                data.itemBooks[itemType] = []
            }
            data.itemBooks[itemType].push(action)

            return {itemBooks: data.itemBooks}
        }, queue)
    }

    getItemBook(itemType, flip) {
        return this.getItemBooks(flip)[itemType]
    }

    hasItemBook(itemType, flip) {
        return itemType in this.getItemBooks(flip)
    }

    /// stack ///

    /**
     * 
     */
    getQueue(flip) {
        return this.stack
    }

    /**
     * 
     * @param {() => boolean} func
     */
    pushToStack(func) {
        this.stack.push(func)
    }

    /**
     * 
     * @param {number} dt
     */
    processStack(dt) {
        while (true) {
            if (this.stack.length === 0) {
                return
            }

            if (this.stack[0]() === false) {
                return
            } else {
                this.stack.shift()
            }
        }
    }

    /// graphics ///

    /**
     * 
     */
    draw() {
        Draw.circle({
            position: this.getPosition(),
            fill: this.getColor(),
            outline: "black"
        })
    }
}