

class ClassEntity {
    constructor() {
        if (ClassEntity.instance) {
            return Entity.instance;
        }
        ClassEntity.instance = this;
    }
}

const Entity = new ClassEntity();
export { Entity };
