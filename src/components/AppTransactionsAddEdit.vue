<template>
    <div class="container">
        <div class="row">
            <div class="col">
                <h1 class="mt-3">Add/Edit Transactions</h1>
            </div>
            <hr>
            <form-tag  v-if="ready" @transactionEditEvent="submitHandler" name="transactionFrom" event="transactionEditEvent">
    
                    <text-input
                        v-model="transaction.name"
                        type="text"
                        required="true"
                        label="Name"
                        :value="transaction.name"
                        name="name"></text-input>
    
                    <text-input
                    v-model="transaction.description"
                    type="text"
                    required="true"
                    label="Description"
                    :value="transaction.description"
                    name="description"></text-input>

                    <div class="mb-3">
                        <label for="budget" class="form-label">Budget</label>
                        <select id="budget"
                        class="form-control"
                            ref="budget"
                            required
                            size="1"
                            v-model="transaction.budget.id">
                            <option v-for="b in budgets" :value="b.id" :key="b.id"> {{ b.name }}</option>


                        </select>
                    </div>


                    <text-input
                    v-model="transaction.quote"
                    type="number"
                    required="true"
                    label="Quote"
                    :value="transaction.quote"
                    name="description"></text-input>

                    <div class="mb-3">
                        <label for="transaction_recurrence" class="form-label">Trs</label>
                        <select id="transaction_recurrence"
                        class="form-control"
                            ref="transaction_recurrence"
                            required
                            size="1"
                            v-model="transaction.transaction_recurrence.id">
                            <option v-for="t in trs" :value="t.id" :key="t.id"> {{ t.name }}</option>


                        </select>
                    </div>

                    <div class="mb-3">
                        <label for="active" class="form-label">Active</label>
                        <select id="active"
                        class="form-control"
                            ref="active"
                            required
                            size="1"
                            v-model="transaction.active">                         
                            <option value="false" key="false">false</option>
                            <option value="true" key="true">true</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="transaction_starts" class="form-label">Starts At</label><br>
                        <date-picker id="transaction_starts" v-model="transaction.starts" />
                    </div>
                    <div class="mb-3">
                        <label for="transaction_ends" class="form-label">Ends At</label><br>
                        <date-picker id="transaction_ends" v-model="transaction.ends" />
                    </div>
                

                    <div class="mb-3">
                        <label for="tag" class="form-label">Tag</label>
                        <select id="tag"
                        class="form-control"
                            ref="tag"
                            required
                            size="1"
                            v-model="transaction.tag.id">
                            <option v-for="t in tags" :value="t.id" :key="t.id"> {{ t.name }}</option>


                        </select>
                    </div>

                    <hr>
                    <div class="float-start">
                        <input type="submit" class="btn btn-primary me-2" value="Save" />
                        <router-link to="/admin/dashboard/transactions" class="btn btn-outline-secondary">Cancel</router-link>
                        
                    </div>
                    <div class="float-end">
                        <a v-if="transaction.id > 0" class="btn btn-danger" href="javascript:void(0);" @click="confirmDelete(transaction.id)">Delete</a>
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
import DatePicker from 'primevue/datepicker';


export default {
    name: 'AppTransactionsAddEdit',
    props: {},
    emits: ['error'],
    components: {
    'form-tag': FormTag,
    'text-input': TextInput,
    'date-picker': DatePicker,
    },
    

    setup(props, cxt) {
        let ready = ref(false);
        let transaction = ref({
            id: 0,
            name: "",
            description: "",
            budget: {},
            quote: 0.0,
            transaction_recurrence: {},
            active: true,
            starts: "",
            ends: "",
            tag: {},
        });
        let tags = ref([]);
        let budgets = ref([]);
        let trs = ref([]);
        const route = useRoute();

        function submitHandler(){
            const payload = {
                id: transaction.value.id,
                name: transaction.value.name,
                description: transaction.value.description,
                budget: {
                    id: transaction.value.budget.id
                },
                quote: parseFloat(transaction.value.quote),
                transaction_recurrence: {
                    id: transaction.value.transaction_recurrence.id
                },
                active: transaction.value.active,
                starts: transaction.value.starts,
                ends: transaction.value.ends,
                tag: {
                    id: transaction.value.tag.id
                },
            }
        
            fetch(`${process.env.VUE_APP_API_URL}/admin/dashboard/transactions`, Security.requestOptions(payload, "PUT"))
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    cxt.emit('error', data.message)
                } else {
                    cxt.emit('success', 'Transaction saved!')
                    router.push("/admin/dashboard/transactions")
                }
            }).catch((error) => {
                cxt.emit('error', error)
            })
        }

        function confirmDelete(id){
            notie.confirm({
                text: "Are you sure you want to delete this transaction?",
                submitText: "Delete",
                submitCallback: () => {
                    let payload = {
                        id: id,
                    }

                    
                    fetch(`${process.env.VUE_APP_API_URL}/admin/dashboard/transactions`, Security.requestOptions(payload, "DELETE"))
                    .then((response) => response.json())
                    .then((data) => {
                        if (data.error) {
                            cxt.emit('error', data.message)
                        } else {
                            cxt.emit('success', 'Transaction deleted!')
                            router.push("/admin/dashboard/transactions")
                        }
                    }).catch((error) => {
                        cxt.emit('error', error)
            })
                }
            })
        }

        onBeforeMount(() => {
            Security.requireToken();
            // fetch transaction for edit
            if(route.params.transactionId > 0) {
            fetch(`${process.env.VUE_APP_API_URL}/admin/dashboard/transactions/${route.params.transactionId}`, Security.requestOptions(""))
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    cxt.emit('error', data.message)
                } else {
                    transaction.value = data.data;
                }
            }).catch((data) => {
                console.log(data)
                cxt.emit('error', `Transaction of id ${route.params.transactionId} can't be obtained form backend.`)
            })
        } 
        //fetch budgets
        fetch(`${process.env.VUE_APP_API_URL}/admin/dashboard/budgets`, Security.requestOptions(""))
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    cxt.emit('error', data.message)
                } else {
                    budgets.value = data.data.budgets;
                }
            }).catch((data) => {
                console.log(data)
                cxt.emit('error', `Budgets can't be obtained.`)
            })
        //fetch tags
        fetch(`${process.env.VUE_APP_API_URL}/admin/dashboard/tags`, Security.requestOptions(""))
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    cxt.emit('error', data.message)
                } else {
                    tags.value = data.data.tags;
                }
            }).catch((data) => {
                console.log(data)
                cxt.emit('error', `Tags can't be obtained.`)
            })
        //fetch transaction recurrences
        fetch(`${process.env.VUE_APP_API_URL}/admin/dashboard/transactions-recurrences`, Security.requestOptions(""))
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    cxt.emit('error', data.message)
                } else {
                    trs.value = data.data.transaction_recurrences;
                    console.log(data.data.transaction_recurrences)
                }
            }).catch((data) => {
                console.log(data)
                cxt.emit('error', `Transactions Recurrences can't be obtained.`)
            })



        ready.value = true
        });
 
        return {
            transaction,
            submitHandler,
            confirmDelete,
            tags,
            budgets,
            trs,
            ready
        }
    }
}
</script>
