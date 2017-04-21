
module.exports = {
    endpoint: 'http://data.open.ac.uk/sparql',
    tclass: 'http://led.kmi.open.ac.uk/term/ListeningExperience',
    graph: 'http://data.open.ac.uk/context/led',
    propblacklist: ['http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://led.kmi.open.ac.uk/term/meta/initial_graph', 'http://rdfs.org/ns/void#inDataset'],
    titleprops: ['http://purl.org/NET/c4dm/event.owl#agent', 'http://www.w3.org/2000/01/rdf-schema#label'],
    snippetprops: ['http://led.kmi.open.ac.uk/term/has_evidence_text'],
    otherprops: []
}
