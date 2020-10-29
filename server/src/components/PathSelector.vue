<template>
    <a-auto-complete
        ref="root"
        v-bind="$attrs"
        :dataSource="candidate"
        allowClear
        @change="onInput" open
    />
</template>

<script>
import { getCurrentInstance, ref } from "vue";
export default {
    name: "PathSelector",
    setup(props, { emit }) {
        const {
            ctx: { $message },
            refs,
        } = getCurrentInstance();
        const candidate = ref([]);
        const dir = () => {
            let paths = props.value.split("/");
            paths.pop();
            return paths.join("/");
        };
        let lastInput = "";
        let searching = false;
        const search = (v) => {
            searching = true;
            fetch("/api/listDir?input=" + v)
                .then((x) => x.json())
                .then((x) => {
                    if (lastInput != v) {
                        search(lastInput);
                    } else {
                        searching = false;
                    }
                    candidate.value = x;
                })
                .catch((reason) => {
                    searching = false;
                });
        };
        return {
            candidate,
            // onSelectCand(name) {
            //     lastInput = dir()+"/"+name+"/"
            //     emit('input',lastInput)
            //     //search(lastInput)
            // },
            onInput(value) {
                lastInput = value;
                if (!searching) search(lastInput);
            },
        };
    },
};
</script>

<style scoped>
</style>