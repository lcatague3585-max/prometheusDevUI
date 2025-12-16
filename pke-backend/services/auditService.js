class AuditService {
  constructor() {
    // In a real app, this would connect to a database
    this.logs = new Map();
  }

  async logGeneration(context) {
    const auditId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const logEntry = {
      id: auditId,
      timestamp: new Date(),
      userId: context.userId,
      invocationType: context.type,
      gatingResults: context.gatingResults,
      input: context.rawInput,
      output: context.result,
      validation: context.validation,
      attempts: context.attempts,
      finalGrade: context.finalGrade,
      status: 'generated'
    };

    this.logs.set(auditId, logEntry);
    
    // In production, save to database
    console.log('Audit logged:', auditId);
    
    return logEntry;
  }

  async logAcceptance(auditId, acceptanceData) {
    const logEntry = this.logs.get(auditId);
    
    if (!logEntry) {
      throw new Error('Audit log not found');
    }

    logEntry.acceptedAt = acceptanceData.acceptedAt;
    logEntry.acceptedContent = acceptanceData.acceptedContent;
    logEntry.userRevisions = acceptanceData.revisions;
    logEntry.status = 'accepted';
    logEntry.acceptedBy = acceptanceData.userId;

    // Update in database in production
    console.log('Acceptance logged for:', auditId);
    
    return logEntry;
  }

  async getLog(auditId) {
    return this.logs.get(auditId);
  }

  async getLogsByUser(userId, limit = 50) {
    const userLogs = [];
    for (const [id, log] of this.logs) {
      if (log.userId === userId) {
        userLogs.push(log);
        if (userLogs.length >= limit) break;
      }
    }
    return userLogs;
  }
}

module.exports = AuditService;
