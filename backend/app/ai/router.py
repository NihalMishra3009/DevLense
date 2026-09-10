import re
from app.core.constants import IntentType

class IntentRouter:
    def __init__(self):
        self.feature_plan_patterns = [
            r"how (?:would|can|do|could) (?:i|we) (?:add|integrate|implement|build)",
            r"how to (?:add|integrate|implement|build|create)",
            r"feature plan", r"plan for", r"integrate", r"create a new"
        ]
        self.onboarding_patterns = [
            r"onboard", r"getting started", r"how to start", r"reading order", r"new developer"
        ]
        self.summary_patterns = [
            r"summary", r"overview", r"what is this project", r"tech stack", r"purpose"
        ]
        self.structure_patterns = [
            r"structure", r"architecture", r"layout", r"folders?", r"directories",
            r"how is .* organized", r"entry\s*point", r"project layout"
        ]
        self.discovery_patterns = [
            r"where is", r"where are", r"find", r"locate", r"which file",
            r"\bauth\b", r"\blogin\b", r"\bsignup\b", r"\bdatabase\b", r"\broute\b", r"\bapi\b",
            r"\bstripe\b", r"\bpayment\b", r"\btoken\b", r"\bjwt\b", r"\bmodel\b", r"\bcontroller\b"
        ]
        self.code_qa_patterns = [
            r"what does .* do", r"how does .* work", r"explain (?:the|function|class|method)",
            r"implementation", r"lifecycle", r"process"
        ]

    def route(self, question: str) -> str:
        q = question.lower().strip()
        
        for p in self.feature_plan_patterns:
            if re.search(p, q):
                return IntentType.FEATURE_PLAN
                
        for p in self.onboarding_patterns:
            if re.search(p, q):
                return IntentType.ONBOARDING
                
        for p in self.summary_patterns:
            if re.search(p, q):
                return IntentType.SUMMARY
                
        for p in self.structure_patterns:
            if re.search(p, q):
                return IntentType.STRUCTURE
                
        for p in self.discovery_patterns:
            if re.search(p, q):
                return IntentType.DISCOVERY
                
        for p in self.code_qa_patterns:
            if re.search(p, q):
                return IntentType.CODE_QA
                
        return IntentType.GENERAL

intent_router = IntentRouter()
