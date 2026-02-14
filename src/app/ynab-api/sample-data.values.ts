import * as ynab from 'ynab';
import { YnabSampleData } from './sample-data.model';

/**
 * Generate a YYYY-MM date string relative to current month.
 * @param monthsFromNow Number of months from current month (can be negative for past)
 */
function getRelativeMonth(monthsFromNow: number): string {
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth() + monthsFromNow, 1);
    const year = target.getFullYear();
    const month = String(target.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}

// Scheduled change dates (relative to current month)
const contributionIncreaseDate = getRelativeMonth(12);  // +$1000/month contribution in 1 year
const studentLoanPayoffDate = getRelativeMonth(42);     // Student loans paid off in 3.5 years
const carPaidOffDate = getRelativeMonth(48);            // Car paid off in 4 years
const mortgagePayoffDate = getRelativeMonth(108);       // Mortgage paid off in 9 years

const sampleBudgets: ynab.BudgetSummary[] = [
    {
        'id': '2fa4e8e8-93cd-4651-9fac-cf2c5110efd9',
        'name': 'Sample Budget'
    }
];

const sampleAccounts: ynab.Account[] = [
    {
        'id': '2fa4eba8-8c06-4688-9282-e300f2a781c7',
        'name': 'Retirement Accounts',
        'type': ynab.AccountType.OtherAsset,
        'on_budget': false,
        'closed': false,
        'note': '7%\nAll IRAs, 401ks',
        'balance': 75000000,
        'cleared_balance': 75000000,
        'uncleared_balance': 0,
        'deleted': false,
        'transfer_payee_id': '385482bd-c2ba-40cb-99f2-3ffa03083293'
    },
    {
        'id': '2fa4efeb-c837-464d-b3b2-a28bd0e6f046',
        'name': 'HSA Total',
        'type': ynab.AccountType.OtherAsset,
        
        'on_budget': false,
        'closed': false,
        'note': `7%\nBR4 +m 300 BR4 ${contributionIncreaseDate} +m 500`,
        'balance': 10000000,
        'cleared_balance': 10000000,
        'uncleared_balance': 0,
        'deleted': false,
        'transfer_payee_id': '385482bd-c2ba-40cb-99f2-3ffa03083293'
    },
    {
        'id': '2fa4e6fe-9294-4638-beb1-139ba4cbe954',
        'name': 'Taxable Account Total',
        'type': ynab.AccountType.OtherAsset,
        'on_budget': false,
        'closed': false,
        'note': '7%',
        'balance': 2500000,
        'cleared_balance': 2500000,
        'uncleared_balance': 0,
        'deleted': false,
        'transfer_payee_id': '385482bd-c2ba-40cb-99f2-3ffa03083293'
    },
    {
        'id': '2fa4eb1b-e194-4646-9b25-3096040be1cd',
        'name': 'Checking',
        'type': ynab.AccountType.Checking,
        'on_budget': true,
        'closed': false,
        'note': null,
        'balance': 2500000,
        'cleared_balance': 2500000,
        'uncleared_balance': 0,
        'deleted': false,
        'transfer_payee_id': '385482bd-c2ba-40cb-99f2-3ffa03083293'
    },
    {
        'id': '2fa4e857-46bc-4652-89bb-21875fe5ae6a',
        'name': 'Savings',
        'type': ynab.AccountType.Savings,
        'on_budget': true,
        'closed': false,
        'note': null,
        'balance': 7500000,
        'cleared_balance': 7500000,
        'uncleared_balance': 0,
        'deleted': false,
        'transfer_payee_id': '385482bd-c2ba-40cb-99f2-3ffa03083293'
    },
    {
        'id': '2fa4e819-18a5-46ed-a90b-90584f2a1069',
        'name': 'Student Loans',
        'type': ynab.AccountType.OtherLiability,
        'on_budget': false,
        'closed': false,
        'note': '4.5%',
        'balance': -35000000,
        'cleared_balance': -35000000,
        'uncleared_balance': 0,
        'deleted': false,
        'transfer_payee_id': '385482bd-c2ba-40cb-99f2-3ffa03083293'
    },
    {
        'id': '2fa4e6df-b3cd-46b6-b475-614b0e9a061d',
        'name': 'My Credit Card',
        'type': ynab.AccountType.CreditCard,
        'on_budget': true,
        'closed': false,
        'note': null,
        'balance': 0,
        'cleared_balance': 0,
        'uncleared_balance': 0,
        'deleted': false,
        'transfer_payee_id': '385482bd-c2ba-40cb-99f2-3ffa03083293'
    },
    {
        'id': '2fa4e6a4-5a9c-46e5-92ef-9ceea549b1a9',
        'name': 'Other credit card',
        'type': ynab.AccountType.CreditCard,
        'on_budget': true,
        'closed': false,
        'note': null,
        'balance': 0,
        'cleared_balance': 0,
        'uncleared_balance': 0,
        'deleted': false,
        'transfer_payee_id': '385482bd-c2ba-40cb-99f2-3ffa03083293'
    }
];

const sampleMonth: ynab.MonthDetail = {
    'month': '2018-06-01',
    'note': null,
    'to_be_budgeted': 10652910,
    'age_of_money': 62,
    'income': 0,
    'budgeted': 10000,
    'activity': 10,
    'deleted': false,
    'categories': [
        {
            'id': '2fa4e2bd-cdfe-46a9-a334-e4741a1a62d9',
            'category_group_id': '22fa4e8a-bb82-4688-be21-46bba7c0b385',
            'name': 'Extra Student Loan Payment',
            'hidden': false,
            'note': '',
            'budgeted': 200000,
            'activity': -200000,
            'balance': 0,
            'deleted': false
        },
        {
            'id': '2fa4efc1-d3a8-46c2-ba05-46b2a3c66b3c',
            'category_group_id': '22fa4e51-076d-46ed-95a6-03cc97562527',
            'name': 'Home Improvement',
            'hidden': false,
            'note': null,
            'budgeted': 73960,
            'activity': -197350,
            'balance': 3750,
            'deleted': false
        },
        {
            'id': '2fa4eacb-c52b-463d-9fa7-46b36cbabf05',
            'category_group_id': '22fa4e51-076d-46ed-95a6-03cc97562527',
            'name': 'Medical',
            'hidden': false,
            'note': null,
            'budgeted': 30000,
            'activity': -64000,
            'balance': 0,
            'deleted': false
        },
        {
            'id': '2fa4eff7-1f02-4698-81fc-899acb1a19ff',
            'category_group_id': '22fa4e01-14da-4685-9230-5f92bc0360d6',
            'name': 'Other credit card',
            'hidden': false,
            'note': null,
            'budgeted': 0,
            'activity': 0,
            'balance': 0,
            'deleted': false
        },
        {
            'id': '2fa4e9e2-4637-46f4-913a-da07ac3fb671',
            'category_group_id': '22fa4e01-14da-4685-9230-5f92bc0360d6',
            'name': 'My Credit Card',
            'hidden': false,
            'note': null,
            'budgeted': 0,
            'activity': 0,
            'balance': 0,
            'deleted': false
        },
        {
            'id': '2fa4ef7d-86cd-46b7-8254-50cfb6911d43',
            'category_group_id': '22fa4e51-076d-46ed-95a6-03cc97562527',
            'name': 'Haircuts, etc',
            'hidden': false,
            'note': null,
            'budgeted': 18000,
            'activity': -18000,
            'balance': 0,
            'deleted': false
        },
        {
            'id': '2fa4e4b4-8c17-4694-aec5-78c7ac76987a',
            'category_group_id': '22fa4e5a-6a9f-4686-899a-a38f87a71941',
            'name': 'Water',
            'hidden': false,
            'note': '',
            'budgeted': 40210,
            'activity': -46210,
            'balance': 0,
            'deleted': false
        },
        {
            'id': '2fa4e641-58f1-467d-8e9c-aa4372739413',
            'category_group_id': '22fa4e7b-8de3-46a1-b7f6-76f5d4e3de41',
            'name': 'Taxable',
            'hidden': false,
            'note': '',
            'budgeted': 385000,
            'activity': -385000,
            'balance': 0,
            'deleted': false
        },
        {
            'id': '2fa4e5c4-c770-4614-8d6f-7922b42dd8d6',
            'category_group_id': '22fa4e0e-788f-4675-8a85-d260bf6f5412',
            'name': 'Vacation',
            'hidden': false,
            'note': '',
            'budgeted': 100000,
            'activity': -235150,
            'balance': 464850,
            'deleted': false
        },
        {
            'id': '2fa4e590-79fe-4603-8b07-f4876284a54c',
            'category_group_id': '22fa4e7b-8de3-46a1-b7f6-76f5d4e3de41',
            'name': 'IRA',
            'hidden': false,
            'note': '\nBR4:+ 500',
            'budgeted': 920000,
            'activity': -920000,
            'balance': 0,
            'deleted': false
        },
        {
            'id': '2fa4eb76-8440-46a6-9638-945a7548b893',
            'category_group_id': '22fa4e7b-8de3-46a1-b7f6-76f5d4e3de41',
            'name': '401k',
            'hidden': false,
            'note': `BR4:+:1541.66\nBR4 ${contributionIncreaseDate} + 2541.66`,
            'budgeted': 0,
            'activity': 0,
            'balance': 0,
            'deleted': false
        },
        {
            'id': '2fa4e694-96a6-46d8-b20b-464a56ff81ac',
            'category_group_id': '22fa4e8a-bb82-4688-be21-46bba7c0b385',
            'name': 'Student Loans',
            'hidden': false,
            'note': `BR4 FI 800 BR4 ${studentLoanPayoffDate} FI 0`,
            'budgeted': 1000000,
            'activity': -1000000,
            'balance': 0,
            'deleted': false
        },
        {
            'id': '2fa4e5b1-b156-468f-b192-923615be50be',
            'category_group_id': '22fa4e30-a44e-464d-ba99-bc5953c2584d',
            'name': 'HOA',
            'hidden': false,
            'note': 'BR4 FI 200 BR4 LFI 0',
            'budgeted': 200000,
            'activity': -200000,
            'balance': 0,
            'deleted': false
        },
        {
            'id': '2fa4e723-db94-46a4-9844-21c9e6987064',
            'category_group_id': '22fa4e30-a44e-464d-ba99-bc5953c2584d',
            'name': 'Mortgage, PMI, Taxes',
            'hidden': false,
            'note': `BR4:F:1100\nBR4:L:400\nBR4 ${mortgagePayoffDate} FI 400\nBR4 ${mortgagePayoffDate} LFI 100`,
            'budgeted': 1500000,
            'activity': -1500000,
            'balance': 10,
            'deleted': false
        },
        {
            'id': '2fa4e00f-c1ad-46cf-b53e-36a6d9fe867e',
            'category_group_id': '22fa4e51-076d-46ed-95a6-03cc97562527',
            'name': 'Professional Services',
            'hidden': false,
            'note': 'Tax Prep',
            'budgeted': 23750,
            'activity': 0,
            'balance': 107500,
            'deleted': false
        },
        {
            'id': '2fa4e9f0-dd78-469e-a998-e838a341b8c2',
            'category_group_id': '22fa4e49-59fa-4690-869e-4650a054db06',
            'name': 'Fun - Player2',
            'hidden': false,
            'note': '',
            'budgeted': 200000,
            'activity': -106900,
            'balance': 280540,
            'deleted': false
        },
        {
            'id': '2fa4e5a5-3e53-460e-8172-467ab7600fc5',
            'category_group_id': '22fa4e49-59fa-4690-869e-4650a054db06',
            'name': 'Fun - Player1',
            'hidden': false,
            'note': '',
            'budgeted': 200000,
            'activity': -28560,
            'balance': 217350,
            'deleted': false
        },
        {
            'id': '2fa4e17b-d32f-4606-b2b3-19f03ef0a0d6',
            'category_group_id': '22fa4e49-59fa-4690-869e-4650a054db06',
            'name': 'Fun - Shared',
            'hidden': false,
            'note': '',
            'budgeted': 200000,
            'activity': -57670,
            'balance': 157860,
            'deleted': false
        },
        {
            'id': '2fa4e2c5-edfe-460e-9791-9c364b4b213b',
            'category_group_id': '22fa4e0e-788f-4675-8a85-d260bf6f5412',
            'name': 'Work - Eating Out',
            'hidden': false,
            'note': '',
            'budgeted': 150000,
            'activity': -99500,
            'balance': 50500,
            'deleted': false
        },
        {
            'id': '2fa4ec24-02c5-46ff-8e2e-b877dfa08865',
            'category_group_id': '22fa4e5a-6a9f-4686-899a-a38f87a71941',
            'name': 'Internet',
            'hidden': false,
            'note': null,
            'budgeted': 45000,
            'activity': -46000,
            'balance': 0,
            'deleted': false
        },
        {
            'id': '2fa4e831-d9a8-4604-b216-58618e9141a8',
            'category_group_id': '22fa4e5a-6a9f-4686-899a-a38f87a71941',
            'name': 'Groceries',
            'hidden': false,
            'note': '',
            'budgeted': 250000,
            'activity': -246750,
            'balance': 53970,
            'deleted': false
        },
        {
            'id': '2fa4e4ab-9bd1-4635-8f51-dd0f2c52d8fc',
            'category_group_id': '22fa4e5a-6a9f-4686-899a-a38f87a71941',
            'name': 'Gas (Natural)',
            'hidden': false,
            'note': null,
            'budgeted': 45000,
            'activity': 0,
            'balance': 45000,
            'deleted': false
        },
        {
            'id': '2fa4e5fd-0509-467c-b971-2d75315ae9b7',
            'category_group_id': '22fa4e51-076d-46ed-95a6-03cc97562527',
            'name': 'Software Subscriptions',
            'hidden': false,
            'note': '',
            'budgeted': 3750,
            'activity': 0,
            'balance': 15000,
            'deleted': false
        },
        {
            'id': '2fa4e2b8-1aca-46d6-b998-bb16c41c4efa',
            'category_group_id': '22fa4e7b-8de3-46a1-b7f6-76f5d4e3de41',
            'name': 'Emergency Fund',
            'hidden': false,
            'note': null,
            'budgeted': 0,
            'activity': 0,
            'balance': 0,
            'deleted': false
        },
        {
            'id': '2fa4e9b4-b7b7-461e-8976-a9ba7afc29c1',
            'category_group_id': '22fa4e0e-788f-4675-8a85-d260bf6f5412',
            'name': 'Giving',
            'hidden': false,
            'note': null,
            'budgeted': 20000,
            'activity': 0,
            'balance': 0,
            'deleted': false
        },
        {
            'id': '2fa4e361-b9ba-46b8-b7ff-b9f6e06f9d54',
            'category_group_id': '22fa4ead-517d-46bd-bdb4-3ce3ee609962',
            'name': 'Deferred Income SubCategory',
            'hidden': false,
            'note': null,
            'budgeted': 0,
            'activity': 0,
            'balance': 0,
            'deleted': false
        },
        {
            'id': '2fa4e2d2-e2fa-469f-9177-f82105c668b4',
            'category_group_id': '22fa4e9c-76b2-46e6-8526-06c68b88e046',
            'name': 'Computer Replacement',
            'hidden': true,
            'note': null,
            'budgeted': 0,
            'activity': 0,
            'balance': 0,
            'deleted': false
        },
        {
            'id': '2fa4e396-0a10-466c-ad67-2542ef1a1407',
            'category_group_id': '22fa4e9c-76b2-46e6-8526-06c68b88e046',
            'name': 'Health Insurance',
            'hidden': true,
            'note': '',
            'budgeted': 0,
            'activity': 0,
            'balance': 0,
            'deleted': false
        },
        {
            'id': '2fa4e176-0ef0-4651-8027-0350eafa4917',
            'category_group_id': '22fa4ead-517d-46bd-bdb4-3ce3ee609962',
            'name': 'Immediate Income SubCategory',
            'hidden': false,
            'note': null,
            'budgeted': 0,
            'activity': 6000870,
            'balance': 315667730,
            'deleted': false
        },
        {
            'id': '2fa4e491-c60f-4689-9d44-029348062558',
            'category_group_id': '22fa4e51-076d-46ed-95a6-03cc97562527',
            'name': 'Clothing',
            'hidden': false,
            'note': null,
            'budgeted': 0,
            'activity': 0,
            'balance': 11490,
            'deleted': false
        },
        {
            'id': '2fa4e2e7-10f4-4614-a572-98c4840c381d',
            'category_group_id': '22fa4ead-517d-46bd-bdb4-3ce3ee609962',
            'name': 'None',
            'hidden': false,
            'note': null,
            'budgeted': 0,
            'activity': 0,
            'balance': 0,
            'deleted': false
        },
        {
            'id': '2fa4e3f2-5680-466a-9e8f-fbc168d289b2',
            'category_group_id': '22fa4e90-3797-4646-b26b-dfbfbe2dde62',
            'name': 'Auto Maintenance',
            'hidden': false,
            'note': '',
            'budgeted': 0,
            'activity': 0,
            'balance': 0,
            'deleted': false
        },
        {
            'id': '2fa4ecba-5fca-46a7-be00-6afbba99f032',
            'category_group_id': '22fa4e0e-788f-4675-8a85-d260bf6f5412',
            'name': 'Personal Development',
            'hidden': false,
            'note': '',
            'budgeted': 0,
            'activity': 0,
            'balance': 1000,
            'deleted': false
        },
        {
            'id': '2fa4e756-aa8e-460f-9c12-6d94de464b85',
            'category_group_id': '22fa4e51-076d-46ed-95a6-03cc97562527',
            'name': 'Life Insurance',
            'hidden': false,
            'note': '',
            'budgeted': 38100,
            'activity': 0,
            'balance': 335930,
            'deleted': false
        },
        {
            'id': '2fa4ee59-b8c6-4629-b0e6-7023db038310',
            'category_group_id': '22fa4e0e-788f-4675-8a85-d260bf6f5412',
            'name': 'Gifts',
            'hidden': false,
            'note': '',
            'budgeted': 70000,
            'activity': -58880,
            'balance': 30460,
            'deleted': false
        },
        {
            'id': '2fa4e939-ca5b-463e-86b6-9c31d657377e',
            'category_group_id': '22fa4e90-3797-4646-b26b-dfbfbe2dde62',
            'name': 'Auto Insurance',
            'hidden': false,
            'note': `BR4 FI 142 BR4 LFI 100\nBR4 ${carPaidOffDate} FI 80\nBR4 ${carPaidOffDate} LFI 60`,
            'budgeted': 142000,
            'activity': 0,
            'balance': 654150,
            'deleted': false
        },
        {
            'id': '2fa4ee0d-efe9-4620-9279-63df415f475c',
            'category_group_id': '22fa4e5a-6a9f-4686-899a-a38f87a71941',
            'name': 'Electric',
            'hidden': false,
            'note': null,
            'budgeted': 40000,
            'activity': -31890,
            'balance': 26540,
            'deleted': false
        },
        {
            'id': '2fa4e8c8-fa07-4606-93df-3b1029239c37',
            'category_group_id': '22fa4e0e-788f-4675-8a85-d260bf6f5412',
            'name': 'House Down Payment',
            'hidden': false,
            'note': '',
            'budgeted': 100000,
            'activity': 0,
            'balance': 2600000,
            'deleted': false
        },
        {
            'id': '2fa4ee16-8df9-4688-85a4-7a387de2cdcd',
            'category_group_id': '22fa4e5a-6a9f-4686-899a-a38f87a71941',
            'name': 'Phone',
            'hidden': false,
            'note': '',
            'budgeted': 155940,
            'activity': -148660,
            'balance': 13990,
            'deleted': false
        },
        {
            'id': '2fa4eacb-0923-4638-b456-514a4f7d4225',
            'category_group_id': '22fa4e90-3797-4646-b26b-dfbfbe2dde62',
            'name': 'Transportation',
            'hidden': false,
            'note': null,
            'budgeted': 100000,
            'activity': -37740,
            'balance': 112830,
            'deleted': false
        },
        {
            'id': '2fa4e1bf-68c2-46f4-a63b-76a67f8dd5bb',
            'category_group_id': '22fa4e9c-76b2-46e6-8526-06c68b88e046',
            'name': 'Renter\'s/Home Insurance',
            'hidden': true,
            'note': null,
            'budgeted': 0,
            'activity': 0,
            'balance': 0,
            'deleted': false
        }
    ]
};

const sampleMonths: ynab.MonthSummary[] = [
    Object.assign({
        'month': '2018-06-01',
        'note': null,
        'to_be_budgeted': 236350,
        'age_of_money': 58
    }, sampleMonth)
];

const sampleCategoryGroupsWithCategories: ynab.CategoryGroupWithCategories[] = [
    {
        'id': '2fa4e030-a44e-464d-ba99-bc5953c2584d',
        'name': 'Housing',
        'hidden': false,
        'deleted': false,
        'categories': [
            {
                'id': '2fa4e723-db94-46a4-9844-21c9e6987064',
                'category_group_id': '22fa4e30-a44e-464d-ba99-bc5953c2584d',
                'name': 'Mortgage, PMI, Taxes',
                'hidden': false,
                'note': `BR4:F:1100\nBR4:L:400\nBR4 ${mortgagePayoffDate} FI 400\nBR4 ${mortgagePayoffDate} LFI 100`,
                'budgeted': 1500000,
                'activity': -1500000,
                'balance': 10,
                'deleted': false
            },
            {
                'id': '2fa4e5b1-b156-468f-b192-923615be50be',
                'category_group_id': '22fa4e30-a44e-464d-ba99-bc5953c2584d',
                'name': 'HOA',
                'hidden': false,
                'note': 'BR4 FI 200 BR4 LFI 0',
                'budgeted': 200000,
                'activity': -200000,
                'balance': 0,
                'deleted': false
            }
        ]
    },
    {
        'id': '2fa4e890-3797-4646-b26b-dfbfbe2dde62',
        'name': 'Transportation',
        'hidden': false,
        'deleted': false,
        'categories': [
            {
                'id': '2fa4eacb-0923-4638-b456-514a4f7d4225',
                'category_group_id': '22fa4e90-3797-4646-b26b-dfbfbe2dde62',
                'name': 'Transportation',
                'hidden': false,
                'note': null,
                'budgeted': 100000,
                'activity': -37740,
                'balance': 112830,
                'deleted': false
            },
            {
                'id': '2fa4e3f2-5680-466a-9e8f-fbc168d289b2',
                'category_group_id': '22fa4e90-3797-4646-b26b-dfbfbe2dde62',
                'name': 'Auto Maintenance',
                'hidden': false,
                'note': '',
                'budgeted': 0,
                'activity': 0,
                'balance': 0,
                'deleted': false
            },
            {
                'id': '2fa4e939-ca5b-463e-86b6-9c31d657377e',
                'category_group_id': '22fa4e90-3797-4646-b26b-dfbfbe2dde62',
                'name': 'Auto Insurance',
                'hidden': false,
                'note': `BR4 FI 142 BR4 LFI 100\nBR4 ${carPaidOffDate} FI 80\nBR4 ${carPaidOffDate} LFI 60`,
                'budgeted': 142000,
                'activity': 0,
                'balance': 654150,
                'deleted': false
            }
        ]
    },
    {
        'id': '2fa4ea5a-6a9f-4686-899a-a38f87a71941',
        'name': 'Immediate Obligations',
        'hidden': false,
        'deleted': false,
        'categories': [
            {
                'id': '2fa4ee0d-efe9-4620-9279-63df415f475c',
                'category_group_id': '22fa4e5a-6a9f-4686-899a-a38f87a71941',
                'name': 'Electric',
                'hidden': false,
                'note': null,
                'budgeted': 40000,
                'activity': -31890,
                'balance': 26540,
                'deleted': false
            },
            {
                'id': '2fa4e4b4-8c17-4694-aec5-78c7ac76987a',
                'category_group_id': '22fa4e5a-6a9f-4686-899a-a38f87a71941',
                'name': 'Water',
                'hidden': false,
                'note': '',
                'budgeted': 40210,
                'activity': -46210,
                'balance': 0,
                'deleted': false
            },
            {
                'id': '2fa4e4ab-9bd1-4635-8f51-dd0f2c52d8fc',
                'category_group_id': '22fa4e5a-6a9f-4686-899a-a38f87a71941',
                'name': 'Gas (Natural)',
                'hidden': false,
                'note': null,
                'budgeted': 45000,
                'activity': 0,
                'balance': 45000,
                'deleted': false
            },
            {
                'id': '2fa4e831-d9a8-4604-b216-58618e9141a8',
                'category_group_id': '22fa4e5a-6a9f-4686-899a-a38f87a71941',
                'name': 'Groceries',
                'hidden': false,
                'note': '',
                'budgeted': 250000,
                'activity': -246750,
                'balance': 53970,
                'deleted': false
            },
            {
                'id': '2fa4ec24-02c5-46ff-8e2e-b877dfa08865',
                'category_group_id': '22fa4e5a-6a9f-4686-899a-a38f87a71941',
                'name': 'Internet',
                'hidden': false,
                'note': null,
                'budgeted': 45000,
                'activity': -46000,
                'balance': 0,
                'deleted': false
            },
            {
                'id': '2fa4ee16-8df9-4688-85a4-7a387de2cdcd',
                'category_group_id': '22fa4e5a-6a9f-4686-899a-a38f87a71941',
                'name': 'Phone',
                'hidden': false,
                'note': '',
                'budgeted': 155940,
                'activity': -148660,
                'balance': 13990,
                'deleted': false
            }
        ]
    },
    {
        'id': '2fa4ed8a-bb82-4688-be21-46bba7c0b385',
        'name': 'Debt Payments',
        'hidden': false,
        'deleted': false,
        'categories': [
            {
                'id': '2fa4e694-96a6-46d8-b20b-464a56ff81ac',
                'category_group_id': '22fa4e8a-bb82-4688-be21-46bba7c0b385',
                'name': 'Student Loans',
                'hidden': false,
                'note': `BR4 FI 800 BR4 ${studentLoanPayoffDate} FI 0`,
                'budgeted': 800000,
                'activity': -800000,
                'balance': 0,
                'deleted': false
            },
            {
                'id': '2fa4e2bd-cdfe-46a9-a334-e4741a1a62d9',
                'category_group_id': '22fa4e8a-bb82-4688-be21-46bba7c0b385',
                'name': 'Extra Student Loan Payment',
                'hidden': false,
                'note': '',
                'budgeted': 200000,
                'activity': -200000,
                'balance': 0,
                'deleted': false
            }
        ]
    },
    {
        'id': '2fa4ee51-076d-46ed-95a6-03cc97562527',
        'name': 'True Expenses',
        'hidden': false,
        'deleted': false,
        'categories': [
            {
                'id': '2fa4e756-aa8e-460f-9c12-6d94de464b85',
                'category_group_id': '22fa4e51-076d-46ed-95a6-03cc97562527',
                'name': 'Life Insurance',
                'hidden': false,
                'note': '',
                'budgeted': 38100,
                'activity': 0,
                'balance': 335930,
                'deleted': false
            },
            {
                'id': '2fa4e00f-c1ad-46cf-b53e-36a6d9fe867e',
                'category_group_id': '22fa4e51-076d-46ed-95a6-03cc97562527',
                'name': 'Professional Services',
                'hidden': false,
                'note': 'Tax Prep',
                'budgeted': 23750,
                'activity': 0,
                'balance': 107500,
                'deleted': false
            },
            {
                'id': '2fa4efc1-d3a8-46c2-ba05-46b2a3c66b3c',
                'category_group_id': '22fa4e51-076d-46ed-95a6-03cc97562527',
                'name': 'Home Improvement',
                'hidden': false,
                'note': null,
                'budgeted': 73960,
                'activity': -197350,
                'balance': 3750,
                'deleted': false
            },
            {
                'id': '2fa4eacb-c52b-463d-9fa7-46b36cbabf05',
                'category_group_id': '22fa4e51-076d-46ed-95a6-03cc97562527',
                'name': 'Medical',
                'hidden': false,
                'note': null,
                'budgeted': 30000,
                'activity': -64000,
                'balance': 0,
                'deleted': false
            },
            {
                'id': '2fa4e491-c60f-4689-9d44-029348062558',
                'category_group_id': '22fa4e51-076d-46ed-95a6-03cc97562527',
                'name': 'Clothing',
                'hidden': false,
                'note': null,
                'budgeted': 0,
                'activity': 0,
                'balance': 11490,
                'deleted': false
            },
            {
                'id': '2fa4ef7d-86cd-46b7-8254-50cfb6911d43',
                'category_group_id': '22fa4e51-076d-46ed-95a6-03cc97562527',
                'name': 'Haircuts, etc',
                'hidden': false,
                'note': null,
                'budgeted': 18000,
                'activity': -18000,
                'balance': 0,
                'deleted': false
            },
            {
                'id': '2fa4e5fd-0509-467c-b971-2d75315ae9b7',
                'category_group_id': '22fa4e51-076d-46ed-95a6-03cc97562527',
                'name': 'Software Subscriptions',
                'hidden': false,
                'note': '',
                'budgeted': 3750,
                'activity': 0,
                'balance': 15000,
                'deleted': false
            }
        ]
    },
    {
        'id': '2fa4ea0e-788f-4675-8a85-d260bf6f5412',
        'name': 'Quality of Life Goals',
        'hidden': false,
        'deleted': false,
        'categories': [
            {
                'id': '2fa4ee59-b8c6-4629-b0e6-7023db038310',
                'category_group_id': '22fa4e0e-788f-4675-8a85-d260bf6f5412',
                'name': 'Gifts',
                'hidden': false,
                'note': '',
                'budgeted': 70000,
                'activity': -58880,
                'balance': 30460,
                'deleted': false
            },
            {
                'id': '2fa4e2c5-edfe-460e-9791-9c364b4b213b',
                'category_group_id': '22fa4e0e-788f-4675-8a85-d260bf6f5412',
                'name': 'Work - Eating Out',
                'hidden': false,
                'note': '',
                'budgeted': 150000,
                'activity': -99500,
                'balance': 50500,
                'deleted': false
            },
            {
                'id': '2fa4e8c8-fa07-4606-93df-3b1029239c37',
                'category_group_id': '22fa4e0e-788f-4675-8a85-d260bf6f5412',
                'name': 'House Down Payment',
                'hidden': false,
                'note': '',
                'budgeted': 100000,
                'activity': 0,
                'balance': 2600000,
                'deleted': false
            },
            {
                'id': '2fa4e5c4-c770-4614-8d6f-7922b42dd8d6',
                'category_group_id': '22fa4e0e-788f-4675-8a85-d260bf6f5412',
                'name': 'Vacation',
                'hidden': false,
                'note': '',
                'budgeted': 100000,
                'activity': -235150,
                'balance': 464850,
                'deleted': false
            },
            {
                'id': '2fa4ecba-5fca-46a7-be00-6afbba99f032',
                'category_group_id': '22fa4e0e-788f-4675-8a85-d260bf6f5412',
                'name': 'Personal Development',
                'hidden': false,
                'note': '',
                'budgeted': 0,
                'activity': 0,
                'balance': 1000,
                'deleted': false
            },
            {
                'id': '2fa4e9b4-b7b7-461e-8976-a9ba7afc29c1',
                'category_group_id': '22fa4e0e-788f-4675-8a85-d260bf6f5412',
                'name': 'Giving',
                'hidden': false,
                'note': null,
                'budgeted': 20000,
                'activity': 0,
                'balance': 0,
                'deleted': false
            }
        ]
    },
    {
        'id': '2fa4ea7b-8de3-46a1-b7f6-76f5d4e3de41',
        'name': 'Financial Independence',
        'hidden': false,
        'deleted': false,
        'categories': [
            {
                'id': '2fa4e641-58f1-467d-8e9c-aa4372739413',
                'category_group_id': '22fa4e7b-8de3-46a1-b7f6-76f5d4e3de41',
                'name': 'Taxable',
                'hidden': false,
                'note': '',
                'budgeted': 385000,
                'activity': -385000,
                'balance': 0,
                'deleted': false
            },
            {
                'id': '2fa4e590-79fe-4603-8b07-f4876284a54c',
                'category_group_id': '22fa4e7b-8de3-46a1-b7f6-76f5d4e3de41',
                'name': 'IRA',
                'hidden': false,
                'note': '5500/12 = 458.\n\nMaxing both IRAs via Dollar Cost averaging\n\nBR4:+: 920',
                'budgeted': 920000,
                'activity': -920000,
                'balance': 0,
                'deleted': false
            },
            {
                'id': '2fa4eb76-8440-46a6-9638-945a7548b893',
                'category_group_id': '22fa4e7b-8de3-46a1-b7f6-76f5d4e3de41',
                'name': '401k',
                'hidden': false,
                'note': `BR4:+:1541.66\nBR4 ${contributionIncreaseDate} + 2541.66`,
                'budgeted': 0,
                'activity': 0,
                'balance': 0,
                'deleted': false
            },
            {
                'id': '2fa4e2b8-1aca-46d6-b998-bb16c41c4efa',
                'category_group_id': '22fa4e7b-8de3-46a1-b7f6-76f5d4e3de41',
                'name': 'Emergency Fund',
                'hidden': false,
                'note': null,
                'budgeted': 0,
                'activity': 0,
                'balance': 0,
                'deleted': false
            }
        ]
    },
    {
        'id': '2fa4e949-59fa-4690-869e-4650a054db06',
        'name': 'Just for Fun',
        'hidden': false,
        'deleted': false,
        'categories': [
            {
                'id': '2fa4e17b-d32f-4606-b2b3-19f03ef0a0d6',
                'category_group_id': '22fa4e49-59fa-4690-869e-4650a054db06',
                'name': 'Fun - Shared',
                'hidden': false,
                'note': '',
                'budgeted': 200000,
                'activity': -57670,
                'balance': 157860,
                'deleted': false
            },
            {
                'id': '2fa4e5a5-3e53-460e-8172-467ab7600fc5',
                'category_group_id': '22fa4e49-59fa-4690-869e-4650a054db06',
                'name': 'Fun - Player1',
                'hidden': false,
                'note': '',
                'budgeted': 200000,
                'activity': -28560,
                'balance': 217350,
                'deleted': false
            },
            {
                'id': '2fa4e9f0-dd78-469e-a998-e838a341b8c2',
                'category_group_id': '22fa4e49-59fa-4690-869e-4650a054db06',
                'name': 'Fun - Player2',
                'hidden': false,
                'note': '',
                'budgeted': 200000,
                'activity': -106900,
                'balance': 280540,
                'deleted': false
            }
        ]
    },
    {
        'id': '2fa4e701-14da-4685-9230-5f92bc0360d6',
        'name': 'Credit Card Payments',
        'hidden': false,
        'deleted': false,
        'categories': [
            {
                'id': '2fa4e9e2-4637-46f4-913a-da07ac3fb671',
                'category_group_id': '22fa4e01-14da-4685-9230-5f92bc0360d6',
                'name': 'My Credit Card',
                'hidden': false,
                'note': null,
                'budgeted': 0,
                'activity': 0,
                'balance': 0,
                'deleted': false
            },
            {
                'id': '2fa4eff7-1f02-4698-81fc-899acb1a19ff',
                'category_group_id': '22fa4e01-14da-4685-9230-5f92bc0360d6',
                'name': 'Other credit card',
                'hidden': false,
                'note': null,
                'budgeted': 0,
                'activity': 0,
                'balance': 0,
                'deleted': false
            }
        ]
    }
];

const sampleBudget: ynab.BudgetDetail = {
    'id': '2fa4e8e8-93cd-4651-9fac-cf2c5110efd9',
    'name': 'Sample Budget',
    accounts: sampleAccounts,
    months: sampleMonths as ynab.MonthDetail[]
};

export const SampleData: YnabSampleData = {
    Budget: sampleBudget,
    Budgets: sampleBudgets,
    Accounts: sampleAccounts,
    Months: sampleMonths,
    Month: sampleMonth,
    CategoryGroupsWithCategories: sampleCategoryGroupsWithCategories,
};
