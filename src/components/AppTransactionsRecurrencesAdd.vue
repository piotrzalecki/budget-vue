<template>
    <div class="container">
        <div class="row">
            <div class="col">
                <h1 class="mt-3">Add/Edit Transaction Recurrence</h1>
            </div>
            <hr>
            <form-tag  v-if="ready" @tRecEditEvent="submitHandler" name="tRecFrom" event="tRecEditEvent">
    
                    <text-input
                        v-model="tRec.name"
                        type="text"
                        required="true"
                        label="Name"
                        :value="tRec.name"
                        name="name"></text-input>
    
                    <text-input
                    v-model="tRec.description"
                    type="text"
                    required="true"
                    label="Description"
                    :value="tRec.description"
                    name="description"></text-input>

                    <text-input
                    v-model="tRec.add_time"
                    type="text"
                    required="true"
                    label="Add Time"
                    :value="tRec.add_time"
                    name="add_time"></text-input>
                    <p class="alert alert-primary"><small><em>This is time in format Y-M-D where Y is a number of years, M is number of months and D is a number of days.
                        For example, monthly transaction would be 0-1-0.</em></small>
                    </p>
                    <hr>
                    <div class="float-start">
                        <input type="submit" class="btn btn-primary me-2" value="Save" />
                        <router-link to="/admin/dashboard/transactions-recurrences" class="btn btn-outline-secondary">Cancel</router-link>
                    </div>
                    <div class="clearfix"></div>

                </form-tag>
            <div v-else>
                Loading...
            </div>
        </div>
    </div>
</template>

<script>
import {ref, onBeforeMount} from 'vue'
import Security from './security.js'
import FormTag from '@/components/forms/FormTag.vue'
import TextInput from '@/components/forms/TextInput.vue'
import router from '../router/index.js'

export default {
    name: 'TransactionsRecurrencesAdd',
    props: {},
    emits: ['error'],
    components: {
    'form-tag': FormTag,
    'text-input': TextInput,
    },
    

    setup(props, cxt) {
        let ready = ref(false);
        let tRec = ref({
            id: 0,
            name: "",
            description: "",
            add_time: "",
        });

        function submitHandler(){
            const payload = {
                id: tRec.value.id,
                name: tRec.value.name,
                description: tRec.value.description,
                add_time: tRec.value.add_time,
            }
        
            fetch(`${process.env.VUE_APP_API_URL}/admin/dashboard/transactions-recurrences`, Security.requestOptions(payload, "PUT"))
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    cxt.emit('error', data.message)
                } else {
                    cxt.emit('success', 'Transaction Recurrence saved!')
                    router.push("/admin/dashboard/transactions-recurrences")
                }
            }).catch((error) => {
                cxt.emit('error', error)
            })
        }

        onBeforeMount(() => {
            Security.requireToken();
            ready.value = true
        });
 
        return {
            tRec,
            submitHandler,
            ready
        }
    }
}
</script>
