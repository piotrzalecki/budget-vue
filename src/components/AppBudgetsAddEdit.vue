<template>
    <div class="container">
        <div class="row">
            <div class="col">
                <h1 class="mt-3">Add/Edit Budgets</h1>
            </div>
            <hr>
            <form-tag  v-if="ready" @budgetEditEvent="submitHandler" name="budgetFrom" event="budgetEditEvent">
    
                    <text-input
                        v-model="budget.name"
                        type="text"
                        required="true"
                        label="Name"
                        :value="budget.name"
                        name="name"></text-input>
    
                    <text-input
                    v-model="budget.description"
                    type="text"
                    required="true"
                    label="Description"
                    :value="budget.description"
                    name="description"></text-input>

                    <hr>
                    <div class="float-start">
                        <input type="submit" class="btn btn-primary me-2" value="Save" />
                        <router-link to="/admin/dashboard/budgets" class="btn btn-outline-secondary">Cancel</router-link>
                    </div>
                    <div class="float-end">
                        <a v-if="budget.id > 0" class="btn btn-danger" href="javascript:void(0);" @click="confirmDelete(budget.id)">Delete</a>
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
import { useRoute } from 'vue-router';
import router from '../router/index.js'
import notie from 'notie'


export default {
    name: 'AppBudgetsAddEdit',
    props: {},
    emits: ['error'],
    components: {
    'form-tag': FormTag,
    'text-input': TextInput,
    },
    

    setup(props, cxt) {
        let ready = ref(false);
        let budget = ref({
            id: 0,
            name: "",
            description: "",
            created_at: null,
            updated_at: null
        });
        const route = useRoute();

        function submitHandler(){
            const payload = {
                id: budget.value.id,
                name: budget.value.name,
                description: budget.value.description,
            }
        
            fetch(`${process.env.VUE_APP_API_URL}/admin/dashboard/budgets`, Security.requestOptions(payload, "PUT"))
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    cxt.emit('error', data.message)
                } else {
                    cxt.emit('success', 'Budget saved!')
                    router.push("/admin/dashboard/budgets")
                }
            }).catch((error) => {
                cxt.emit('error', error)
            })
        }

        function confirmDelete(id){
            notie.confirm({
                text: "Are you sure you want to delete this budget?",
                submitText: "Delete",
                submitCallback: () => {
                    let payload = {
                        id: id,
                    }

                    
                    fetch(`${process.env.VUE_APP_API_URL}/admin/dashboard/budgets`, Security.requestOptions(payload, "DELETE"))
                    .then((response) => response.json())
                    .then((data) => {
                        if (data.error) {
                            cxt.emit('error', data.message)
                        } else {
                            cxt.emit('success', 'Budget deleted!')
                            router.push("/admin/dashboard/budgets")
                        }
                    }).catch((error) => {
                        cxt.emit('error', error)
            })
                }
            })
        }

        onBeforeMount(() => {
            Security.requireToken();
            if(route.params.budgetId > 0) {
            fetch(`${process.env.VUE_APP_API_URL}/admin/dashboard/budgets/${route.params.budgetId}`, Security.requestOptions(""))
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    cxt.emit('error', data.message)
                } else {
                    budget.value = data.data;
                }
            }).catch((data) => {
                console.log(data)
                cxt.emit('error', `Budget of id ${route.params.budgetId} can't be obtained form backend.`)
            })
        } 
        ready.value = true
        });
 
        return {
            budget,
            submitHandler,
            confirmDelete,
            ready
        }
    }
}
</script>
