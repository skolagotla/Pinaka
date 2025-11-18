/**
 * Legal Forms Data
 * 
 * Centralized legal forms for both landlord and tenant sides
 * Reduces duplication and ensures consistency
 */

export const LANDLORD_LEGAL_FORMS = [
  { key: 'N1', formCode: 'N1', formName: 'I Want to Raise the Rent', description: 'Your tenant\'s rent is the same for a year, and now you want to increase it by the allowed amount', category: 'Rent', urgency: 'Low', available: true, link: '/CA-ON-N1.pdf' },
  { key: 'N2', formCode: 'N2', formName: 'I Need a Bigger Rent Increase', description: 'You spent a lot on major repairs or upgrades and need to raise rent more than the usual limit', category: 'Rent', urgency: 'Low', available: true, link: '/CA-ON-N2.pdf' },
  { key: 'N3', formCode: 'N3', formName: 'My Tenant Agreed to Higher Rent', description: 'Your tenant said yes to paying more rent than the usual increase', category: 'Rent', urgency: 'Low', available: true, link: '/CA-ON-N3.pdf' },
  { key: 'N4', formCode: 'N4', formName: 'Tenant Didn\'t Pay Rent', description: 'Your tenant owes you rent money and you want them to pay up or leave', category: 'Eviction', urgency: 'High', available: true, link: '/CA-ON-N4.pdf' },
  { key: 'N5', formCode: 'N5', formName: 'Tenant is Causing Problems', description: 'Tenant is breaking stuff, being too loud, or you\'ve got too many people living there', category: 'Eviction', urgency: 'Medium', available: true, link: '/CA-ON-N5.pdf' },
  { key: 'N6', formCode: 'N6', formName: 'Tenant is Doing Illegal Stuff', description: 'Your tenant is breaking the law in your rental - drugs, crime, etc.', category: 'Eviction', urgency: 'High', available: true, link: '/CA-ON-N6.pdf' },
  { key: 'N7', formCode: 'N7', formName: 'Tenant is Dangerous', description: 'Someone could get seriously hurt because of what your tenant is doing - acts fast', category: 'Eviction', urgency: 'Urgent', available: true, link: '/CA-ON-N7.pdf' },
  { key: 'N8', formCode: 'N8', formName: 'I Don\'t Want to Renew the Lease', description: 'The lease is almost over and you don\'t want this tenant to stay anymore', category: 'Eviction', urgency: 'Low', available: true, link: '/CA-ON-N8.pdf' },
  { key: 'N9', formCode: 'N9', formName: 'We Both Want to End It Early', description: 'You and your tenant both agree it\'s time to end the lease before it\'s over', category: 'Agreement', urgency: 'Low', available: true, link: '/CA-ON-N9.pdf' },
  { key: 'N10', formCode: 'N10', formName: 'Tenant Said They\'re Moving Out', description: 'Your tenant told you they\'re leaving - this is the form they fill out', category: 'Agreement', urgency: 'Low', available: true, link: '/CA-ON-N10.pdf' },
  { key: 'N11', formCode: 'N11', formName: 'Let\'s Pick a Move-Out Date Together', description: 'You and your tenant agree on exactly when they\'ll move out', category: 'Agreement', urgency: 'Low', available: true, link: '/CA-ON-N11.pdf' },
  { key: 'N12', formCode: 'N12', formName: 'I Need to Move Into My Own Place', description: 'You or your family need to live in your rental unit, so tenant has to leave (2 months notice)', category: 'Eviction', urgency: 'Medium', available: true, link: '/CA-ON-N12.pdf' },
  { key: 'N13', formCode: 'N13', formName: 'I\'m Renovating or Tearing It Down', description: 'You need to do really big repairs or knock the building down, so tenant can\'t stay', category: 'Eviction', urgency: 'Low', available: true, link: '/CA-ON-N13.pdf' },
  { key: 'L1', formCode: 'L1', formName: 'Take Tenant to Court for Rent', description: 'You gave N4, they still didn\'t pay, now you\'re taking them to the Landlord Board', category: 'Application', urgency: 'High', available: true, link: '/CA-ON-L1.pdf' },
  { key: 'L2', formCode: 'L2', formName: 'Tenant Won\'t Leave', description: 'You gave them an eviction notice but they\'re still there - need the Board to make them leave', category: 'Application', urgency: 'High', available: true, link: '/CA-ON-L2.pdf' },
  { key: 'L3', formCode: 'L3', formName: 'Tenant Damaged My Place', description: 'Your tenant wrecked your rental and you want them to pay for the repairs', category: 'Application', urgency: 'Medium', available: true, link: '/CA-ON-L3.pdf' },
  { key: 'L9', formCode: 'L9', formName: 'Tenant Owing Money', description: 'Your tenant owes you money for rent, utilities, or damages and won\'t pay', category: 'Application', urgency: 'Medium', available: true, link: '/CA-ON-L9.pdf' },
];

export const TENANT_LEGAL_FORMS = [
  { key: 'T1', formCode: 'T1', formName: 'Landlord Gave Me Notice', description: 'Your landlord gave you a notice and you think it\'s wrong or unfair', category: 'Notice Response', urgency: 'High', available: true, link: '/CA-ON-T1.pdf' },
  { key: 'T2', formCode: 'T2', formName: 'My Landlord Did Something Wrong', description: 'Your landlord isn\'t following the rules - not doing repairs, harassing you, or changing locks', category: 'Tenant Rights', urgency: 'Medium', available: true, link: '/CA-ON-T2.pdf' },
  { key: 'T3', formCode: 'T3', formName: 'Get My Stuff Back', description: 'You moved out and your landlord won\'t give you back your belongings', category: 'Property', urgency: 'Low', available: true, link: '/CA-ON-T3.pdf' },
  { key: 'T4', formCode: 'T4', formName: 'Landlord Broke Rent Increase Deal', description: 'Your landlord agreed to do something for a bigger rent increase but didn\'t follow through', category: 'Rent', urgency: 'Low', available: true, link: '/CA-ON-T4.pdf' },
  { key: 'T5', formCode: 'T5', formName: 'Challenge Rent Increase', description: 'Your landlord raised your rent more than allowed or didn\'t give proper notice', category: 'Rent', urgency: 'Medium', available: true, link: '/CA-ON-T5.pdf' },
  { key: 'T6', formCode: 'T6', formName: 'Place Needs Repairs', description: 'Your rental needs fixing and landlord won\'t do it, or you want rent reduced', category: 'Maintenance', urgency: 'High', available: true, link: '/CA-ON-T6.pdf' },
  { key: 'T7', formCode: 'T7', formName: 'Problem with Suite Meter', description: 'There\'s an issue with your separate utility meter or the charges you\'re being billed', category: 'Utilities', urgency: 'Low', available: true, link: '/CA-ON-T7.pdf' },
];

/**
 * Get legal forms by role
 * @param {string} role - 'landlord' or 'tenant'
 * @returns {Array} - Array of legal forms
 */
export function getLegalFormsByRole(role) {
  return role === 'landlord' ? LANDLORD_LEGAL_FORMS : TENANT_LEGAL_FORMS;
}

/**
 * Get legal form by code
 * @param {string} formCode - Form code (e.g., 'N4', 'T1')
 * @returns {Object|null} - Legal form object or null
 */
export function getLegalFormByCode(formCode) {
  const allForms = [...LANDLORD_LEGAL_FORMS, ...TENANT_LEGAL_FORMS];
  return allForms.find(form => form.formCode === formCode) || null;
}

