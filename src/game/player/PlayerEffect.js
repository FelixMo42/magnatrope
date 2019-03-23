import SubEffect from "../action/SubEffect";

export default class extends SubEffect {
    constructor(config) {
        super(config)

        this.addParamater({
            name: "HP"
        })
        
        this.addParamater({
            name: "MP"
        })
    }
}