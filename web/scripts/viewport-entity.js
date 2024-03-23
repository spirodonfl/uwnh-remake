

class ClassViewportEntity {
    constructor() {
        if (ClassViewportEntity.instance) {
            return ViewportEntity.instance;
        }
        ClassViewportEntity.instance = this;
    }
}

const ViewportEntity = new ClassViewportEntity();
export { ViewportEntity };
